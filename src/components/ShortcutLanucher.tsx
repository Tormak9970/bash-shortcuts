import { DialogButton, Field, Focusable } from "decky-frontend-lib";
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
                        max-width: 60px;
                        display: flex;
                        justify-content: center,
                        align-items: center
                    }
                    .custom-buttons > .Panel.Focusable {
                        width: 100%;
                    }

                    .custom-buttons .gamepaddialog_FieldChildren_14_HB {
                        margin: 0px 16px;
                    }
                `}
            </style>
            <div className="custom-buttons">
                <Field label={props.shortcut.name}>
                    <Focusable style={{ display: "flex" }}>
                        <DialogButton onClick={() => PyInterop.launchApp(props.shortcut.name, props.shortcut.cmd)}>
                            <IoRocketSharp />
                        </DialogButton>
                    </Focusable>
                </Field>
            </div>
        </>
    );
}