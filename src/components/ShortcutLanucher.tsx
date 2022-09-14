import { ButtonItem, PanelSectionRow } from "decky-frontend-lib";
import { Fragment } from "react";
import { PyInterop } from "../PyInterop";
import { Shortcut } from "../Shortcut";

import { IoRocketSharp } from "react-icons/io5";

export type ShortcutLauncherProps = {
    shortcut: Shortcut
}
export function ShortcutLauncher(props: ShortcutLauncherProps) {
    return (
        <>
        <style>
            {`
                .custom-buttons {
                    width: inherit;
                    height: inherit;
                    display: inherit;
                }
                .custom-buttons .DialogButton._DialogLayout.Secondary.gamepaddialog_Button_1kn70.Focusable {
                    min-width: 30px;
                    display: flex;
                    justify-content: center,
                    align-items: center
                }
            `}
        </style>
            <PanelSectionRow>
                <div className="custom-buttons">
                    <ButtonItem label={props.shortcut.name} onClick={() => PyInterop.launchApp(props.shortcut.name, props.shortcut.path)} >
                        <IoRocketSharp />
                    </ButtonItem>
                </div>
            </PanelSectionRow>
        </>
    );
}