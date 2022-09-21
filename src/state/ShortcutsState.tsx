import { createContext, FC, useContext, useEffect, useState } from "react";
import { Shortcut } from "../Shortcut"

type ShortcutsDictionary = {
    [key:string]: Shortcut
  }

interface PublicShortcutsState {
    shortcuts: ShortcutsDictionary;
}

interface PublicShortcutsContext extends PublicShortcutsState {
    setShortcuts(shortcuts: ShortcutsDictionary): void;
}

export class ShortcutsState {
    private shortcuts: ShortcutsDictionary = {};

    public eventBus = new EventTarget();

    getPublicState() {
        return {
            "shortcuts": this.shortcuts
        }
    }

    setShortcuts(shortcuts: ShortcutsDictionary) {
        this.shortcuts = shortcuts;
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