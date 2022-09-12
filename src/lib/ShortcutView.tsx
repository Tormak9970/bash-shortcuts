import { Focusable } from "decky-frontend-lib";
import { Shortcut } from "../Shortcut"

import './lib.css';

export type ShortcutViewProps = {
    shortcut: Shortcut
}
export function ShorcutView(props: ShortcutViewProps) {
    return (
        <div className="view-positioner">
            <Focusable style={{borderRadius: "2px"}}>
                <div className="view-wrapper">
                    <img src={props.shortcut.icon} />
                </div>
            </Focusable>
        </div>
    );
}