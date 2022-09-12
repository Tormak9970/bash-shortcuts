import { Focusable } from "decky-frontend-lib";
import { PyInterop } from "../PyInterop";
import { Shortcut } from "../Shortcut"

export type ShortcutViewProps = {
    shortcut: Shortcut
}
export function ShortcutView(props: ShortcutViewProps) {
    return (
        <div style={{ width: "100%", height: "66px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <Focusable style={{borderRadius: "2px"}} onClick={() => { PyInterop.launchApp(props.shortcut.name, props.shortcut.path)}}>
                <div style={{ width: "50px", height: "50px", padding: "4px" }}>
                    <img src={props.shortcut.icon} style={{ width: "50px", height: "50px" }} />
                </div>
            </Focusable>
        </div>
    );
}