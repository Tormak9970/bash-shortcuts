import { Shortcut } from "../Shortcut";
import { ShorcutView } from "./ShortcutView";

import './lib.css';

export type ShortcutListProps = {
    shortcuts: {
        [key:string]: Shortcut
    }
}
export function ShorcutList(props: ShortcutListProps) {
    const comps = Object.values(props.shortcuts).map((itm) => <ShorcutView shortcut={itm} />)
    return (
        <div className="shortcut-grid">{comps}</div>
    );
}