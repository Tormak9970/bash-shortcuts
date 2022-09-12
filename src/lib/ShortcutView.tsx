import { Focusable } from "decky-frontend-lib";
import { Shortcut } from "../Shortcut"

export type ShortcutViewProps = {
    shortcut: Shortcut
}
export function ShorcutView(props: ShortcutViewProps) {
    return (
        <div style={{ width: "100%", height: "66px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <Focusable style={{borderRadius: "2px"}}>
                <div style={{ width: "50px", height: "50px", padding: "4px" }}>
                    <img src={props.shortcut.icon} />
                </div>
            </Focusable>
        </div>
    );
}