import { ButtonItem, ConfirmModal, DialogButton, Field, Focusable, Menu, MenuItem, PanelSection, PanelSectionRow, showContextMenu, showModal } from "decky-frontend-lib";
import { Fragment, useState } from "react";
import { PyInterop } from "../PyInterop";
import { Shortcut } from "../Shortcut";

import { FaEllipsisH, FaArrowsAltV } from "react-icons/fa";
import { EditModal } from "./EditModal";

type ShortcutModProps = {
    shortcut: Shortcut
}

type ShortcutsDictionary = {
    [key:string]: Shortcut
}

export function ManageShortcuts() {
    const [shortcuts, setShortcuts] = useState<ShortcutsDictionary>({});

    function showMenu(e: MouseEvent, shortcut: Shortcut) {
        return showContextMenu(
            <Menu label="Actions" cancelText="Cancel" onCancel={() => {}}>
            <MenuItem onSelected={() => {showModal(
                // @ts-ignore
                <EditModal onConfirm={(updated:Shortcut) => {
                    PyInterop.modShortcut(updated);
                    let shorts = shortcuts;
                    shorts[shortcut.id] = updated;
                    setShortcuts(shorts);
                    reload();
                }} shortcut={shortcut} />
            )}}>Edit</MenuItem>
            <MenuItem onSelected={() => {showModal(
                <ConfirmModal onOK={() => {
                    PyInterop.remShortcut(shortcut);
                    let shorts = shortcuts;
                    delete shorts[shortcut.id];
                    setShortcuts(shorts);
                    reload();
                }} bDestructiveWarning={true}>
                    Are you sure you want to delete this shortcut?
                </ConfirmModal>
            )}}>Delete</MenuItem>
            </Menu>,
            e.currentTarget ?? window
        );
    }
    
    function ShortcutMod(props: ShortcutModProps) {
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
                    `}
                </style>
                <div className="custom-buttons">
                    <Field label={props.shortcut.name}>
                        <Focusable style={{ display: "flex" }}>
                            {/* @ts-ignore */}
                            <DialogButton onClick={(e) => {}} style={{ marginRight: "14px" }}>
                                <FaArrowsAltV />
                            </DialogButton>
                            {/* @ts-ignore */}
                            <DialogButton onClick={ (e) => showMenu(e, props.shortcut) }>
                                <FaEllipsisH />
                            </DialogButton>
                        </Focusable>
                    </Field>
                </div>
            </>
        );
    }

    async function reload() {
        await PyInterop.getShortcuts().then((res) => {
            setShortcuts(res.result as ShortcutsDictionary);
        });
    }
      
    if (Object.values(shortcuts as ShortcutsDictionary).length == 0) {
        reload();
    }
    
    return (
        <>
            <style>{`
                .scoper {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                }
            `}</style>
            <div style={{
                marginBottom: "5px"
            }}>Here you can re-order or remove existing shortcuts</div>
            <div className="scoper">
            {Object.values(shortcuts as ShortcutsDictionary).length > 0 ?
                        Object.values(shortcuts ? shortcuts : {})
                            .sort((a, b) => a.position - b.position)
                            .map((itm: Shortcut) => (
                            <ShortcutMod shortcut={itm} />
                        )) : (
                            <div style={{width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "5px"}}>
                                You don't have any shortcuts right now! You can create new shortcuts from the add menu to the left.
                            </div>
                        )
                    }
                    {/* @ts-ignore */}
                    <ButtonItem layout="below" onClick={reload} bottomSeparator='none'>
                        Reload Shortcuts
                    </ButtonItem>
            </div>
        </>
    );
}