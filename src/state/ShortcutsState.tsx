import { createContext, FC, useContext, useEffect, useState } from "react";
import { Shortcut } from "../lib/data-structures/Shortcut"
import { ReorderableEntry } from "decky-frontend-lib";

type ShortcutsDictionary = {
  [key: string]: Shortcut
}

interface PublicShortcutsState {
  shortcuts: ShortcutsDictionary;
  shortcutsList: Shortcut[];
  runningShortcuts: Set<string>;
  reorderableShortcuts: ReorderableEntry<Shortcut>[];
  currentGame: SteamAppOverview | null;
}

interface PublicShortcutsContext extends PublicShortcutsState {
  setShortcuts(shortcuts: ShortcutsDictionary): void;
  setIsRunning(shortcutId: string, value: boolean): void;
  setCurrentGame(game: SteamAppOverview | null): void;
}

export class ShortcutsState {
  private shortcuts: ShortcutsDictionary = {};
  private shortcutsList: Shortcut[] = [];
  private runningShortcuts = new Set<string>();
  private reorderableShortcuts: ReorderableEntry<Shortcut>[] = [];
  private currentGame: SteamAppOverview | null = null;

  public eventBus = new EventTarget();

  getPublicState() {
    return {
      "shortcuts": this.shortcuts,
      "shortcutsList": this.shortcutsList,
      "runningShortcuts": this.runningShortcuts,
      "reorderableShortcuts": this.reorderableShortcuts,
      "currentGame": this.currentGame
    }
  }

  setIsRunning(shortcutId: string, value: boolean) {
    if (value) {
      this.runningShortcuts.add(shortcutId);
    } else {
      this.runningShortcuts.delete(shortcutId);
    }

    this.runningShortcuts = new Set(this.runningShortcuts.values());

    this.forceUpdate();
  }

  setCurrentGame(game: SteamAppOverview | null): void {
    this.currentGame = game;

    this.forceUpdate();
  }

  setShortcuts(shortcuts: ShortcutsDictionary) {
    this.shortcuts = shortcuts;
    this.shortcutsList = Object.values(this.shortcuts).sort((a, b) => a.position - b.position);
    this.reorderableShortcuts = [];

    for (let i = 0; i < this.shortcutsList.length; i++) {
      const shortcut = this.shortcutsList[i];
      this.reorderableShortcuts[i] = {
        "label": shortcut.name,
        "data": shortcut,
        "position": shortcut.position
      }
    }

    this.reorderableShortcuts.sort((a, b) => a.position - b.position);

    this.forceUpdate();
  }

  private forceUpdate() {
    this.eventBus.dispatchEvent(new Event("stateUpdate"));
  }
}

const ShortcutsContext = createContext<PublicShortcutsContext>(null as any);
export const useShortcutsState = () => useContext(ShortcutsContext);

interface ProviderProps {
  shortcutsStateClass: ShortcutsState
}

export const ShortcutsContextProvider: FC<ProviderProps> = ({
  children,
  shortcutsStateClass
}) => {
  const [publicState, setPublicState] = useState<PublicShortcutsState>({
    ...shortcutsStateClass.getPublicState()
  });

  useEffect(() => {
    function onUpdate() {
      setPublicState({ ...shortcutsStateClass.getPublicState() });
    }

    shortcutsStateClass.eventBus
      .addEventListener("stateUpdate", onUpdate);

    return () => {
      shortcutsStateClass.eventBus
        .removeEventListener("stateUpdate", onUpdate);
    }
  }, []);

  const setShortcuts = (shortcuts: ShortcutsDictionary) => {
    shortcutsStateClass.setShortcuts(shortcuts);
  }

  const setIsRunning = (shortcutId: string, value: boolean) => {
    shortcutsStateClass.setIsRunning(shortcutId, value);
  }

  const setCurrentGame = (game: SteamAppOverview | null) => {
    shortcutsStateClass.setCurrentGame(game);
  }

  return (
    <ShortcutsContext.Provider
      value={{
        ...publicState,
        setShortcuts,
        setIsRunning,
        setCurrentGame
      }}
    >
      {children}
    </ShortcutsContext.Provider>
  )
}