import { DialogButton, Field, Focusable, gamepadDialogClasses } from "decky-frontend-lib";
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

                    .custom-buttons .${gamepadDialogClasses.FieldChildren} {
                        margin: 0px 16px;
                    }
                `}
            </style>
            <div className="custom-buttons">
                <Field label={props.shortcut.name}>
                    <Focusable style={{ display: "flex", width: "100%" }}>
                        <DialogButton onClick={() => PyInterop.launchApp(props.shortcut.name, props.shortcut.cmd)} style={{
                            minWidth: "30px",
                            maxWidth: "60px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}>
                            <IoRocketSharp />
                        </DialogButton>
                    </Focusable>
                </Field>
            </div>
        </>
    );
}