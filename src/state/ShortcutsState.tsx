import { createContext, FC, useContext, useEffect, useState } from "react";
import { Shortcut } from "../lib/data-structures/Shortcut"
import { ReorderableEntry } from "decky-frontend-lib";

type ShortcutsDictionary = {
  [key: string]: Shortcut
}

interface PublicShortcutsState {
  shortcuts: ShortcutsDictionary;
  shortcutsList: Shortcut[];
  reorderableShortcuts: ReorderableEntry<Shortcut>[];
}

interface PublicShortcutsContext extends PublicShortcutsState {
  setShortcuts(shortcuts: ShortcutsDictionary): void;
}

export class ShortcutsState {
  private shortcuts: ShortcutsDictionary = {};
  private shortcutsList: Shortcut[] = [];
  private reorderableShortcuts: ReorderableEntry<Shortcut>[] = [];

  public eventBus = new EventTarget();

  getPublicState() {
    return {
      "shortcuts": this.shortcuts,
      "shortcutsList": this.shortcutsList,
      "reorderableShortcuts": this.reorderableShortcuts
    }
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

  return (
    <ShortcutsContext.Provider
      value={{
        ...publicState,
        setShortcuts
      }}
    >
      {children}
    </ShortcutsContext.Provider>
  )
}