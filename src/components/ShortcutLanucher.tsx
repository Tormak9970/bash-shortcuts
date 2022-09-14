import { ButtonItem, PanelSectionRow } from "decky-frontend-lib";
import { Fragment } from "react";
import { PyInterop } from "../PyInterop";
import { Shortcut } from "../Shortcut";

import { FaShip } from "react-icons/fa";

export type ShortcutLauncherProps = {
    shortcut: Shortcut
}
export function ShortcutLauncher(props: ShortcutLauncherProps) {
    return (
        <>
            <PanelSectionRow>
                <ButtonItem label={props.shortcut.name} onClick={() => PyInterop.launchApp(props.shortcut.name, props.shortcut.path)} >
                    <FaShip />
                </ButtonItem>
            </PanelSectionRow>
        </>
    );
}