import { DialogButton, Field, Focusable, gamepadDialogClasses } from "decky-frontend-lib";
import { Fragment } from "react";
import { Shortcut } from "../Shortcut";

import { IoRocketSharp } from "react-icons/io5";
import { ShortcutManager } from "../lib/ShortcutManager";
import { showToast } from "../general/Toast";

export type ShortcutLauncherProps = {
    shortcut: Shortcut
}

async function runShortcut(shortcut:Shortcut) {
    const status = await ShortcutManager.launchShortcut(shortcut);
    if (!status) {
        showToast("Shortcut failed. Check the associated command.");
    }
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
                        <DialogButton onClick={() => runShortcut(props.shortcut)} style={{
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