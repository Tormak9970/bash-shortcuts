import { ButtonItem, PanelSectionRow } from "decky-frontend-lib";
import { Fragment } from "react";
import { PyInterop } from "../PyInterop";
import { Shortcut } from "../Shortcut";

import { FaShip } from "react-icons/fa";

export type ShortcutListProps = {
    shortcuts: {
        [key:string]: Shortcut
    }
}
export function ShorcutList(props: ShortcutListProps) {
    return (
        <Fragment>
            {Object.values(props.shortcuts)
                .map((itm: Shortcut) => (
                <PanelSectionRow>
                    <ButtonItem label={itm.name} onClick={() => PyInterop.launchApp(itm.name, itm.path)} >
                        <FaShip />
                    </ButtonItem>
                </PanelSectionRow>
            ))}
        </Fragment>
    );
}