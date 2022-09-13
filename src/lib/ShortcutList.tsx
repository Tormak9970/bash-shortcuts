import { Shortcut } from "../Shortcut";
import { ShortcutView } from "./ShortcutView";

export type ShortcutListProps = {
    shortcuts: {
        [key:string]: Shortcut
    }
}
export function ShorcutList(props: ShortcutListProps) {
    const comps = Object.values(props.shortcuts).map((itm) => <ShortcutView shortcut={itm} />);
    return (
        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>{comps}</div>
    );
}