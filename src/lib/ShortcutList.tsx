import { Shortcut } from "../Shortcut";
import { ShorcutView } from "./ShortcutView";

export type ShortcutListProps = {
    shortcuts: {
        [key:string]: Shortcut
    }
}
export function ShorcutList(props: ShortcutListProps) {
    const comps = Object.values(props.shortcuts).map((itm) => <ShorcutView shortcut={itm} />)
    return (
        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>{comps}</div>
    );
}