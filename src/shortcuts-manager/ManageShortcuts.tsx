import { ButtonItem, ConfirmModal, DialogButton, Field, Focusable, Menu, MenuItem, showContextMenu, showModal, GamepadButton as DeckyGamepadButton, GamepadEvent as DeckyGamepadEvent } from "decky-frontend-lib";
import { Fragment } from "react";
import { PyInterop } from "../PyInterop";
import { Shortcut } from "../Shortcut";

import { FaEllipsisH, FaArrowsAltV } from "react-icons/fa";
import { EditModal } from "./EditModal";
import { useShortcutsState } from "../state/ShortcutsState";

type ShortcutModProps = {
    shortcut: Shortcut,
    index: number
}

type ShortcutsDictionary = {
    [key:string]: Shortcut
}

export function ManageShortcuts() {
    let reorderEnabled = false;
    let direction = false; //false = left, true = right
    const {shortcuts, setShortcuts, shortcutsList} = useShortcutsState();

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
                    <Field label={props.shortcut.name} onFocus={(e) => {
                        // set the focused child based on the last selected
                    }}>
                        <Focusable style={{ display: "flex" }} onGamepadDirection={(e:DeckyGamepadEvent) => {
                            switch(e.detail.button) {
                                case DeckyGamepadButton.DIR_DOWN: {
                                    if (reorderEnabled && props.shortcut.position != shortcutsList.length-1) {
                                        const thisShortcut = props.shortcut;
                                        const previous = shortcutsList[props.index+1];
                                        const tmp = thisShortcut.position;
                                        thisShortcut.position = previous.position;
                                        previous.position = tmp;

                                        const refs = shortcuts;
                                        refs[thisShortcut.id] = thisShortcut;
                                        refs[previous.id] = previous;

                                        setShortcuts(refs);
                                    }
                                    break;
                                }
                                case DeckyGamepadButton.DIR_UP: {
                                    if (reorderEnabled && props.shortcut.position != 0) {
                                        const thisShortcut = props.shortcut;
                                        const previous = shortcutsList[props.index-1];
                                        const tmp = thisShortcut.position;
                                        thisShortcut.position = previous.position;
                                        previous.position = tmp;

                                        const refs = shortcuts;
                                        refs[thisShortcut.id] = thisShortcut;
                                        refs[previous.id] = previous;

                                        setShortcuts(refs);
                                    }
                                    break;
                                }
                                case DeckyGamepadButton.DIR_LEFT: {
                                    if (direction) direction = false;
                                    break;
                                }
                                case DeckyGamepadButton.DIR_RIGHT: {
                                    if (!direction) direction = true;
                                    break;
                                }
                            }
                        }} onButtonDown={(e:DeckyGamepadEvent) => {
                            switch(e.detail.button) {
                                case DeckyGamepadButton.OK: {
                                    reorderEnabled = true;
                                    break;
                                }
                            }
                        }} onButtonUp={(e:DeckyGamepadEvent) => {
                            switch(e.detail.button) {
                                case DeckyGamepadButton.OK: {
                                    reorderEnabled = false;
                                    break;
                                }
                            }
                        }}>
                            <DialogButton onClick={(e) => {}} style={{ marginRight: "14px" }}>
                                <FaArrowsAltV />
                            </DialogButton>
                            <DialogButton onClick={(e) => showMenu(e, props.shortcut)}>
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

    console.log(Focusable)
    console.log(DialogButton)
    console.log(Menu)
    console.log(MenuItem)
    
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
                {shortcutsList.length > 0 ?
                    shortcutsList.map((itm: Shortcut, i:number) => (
                        <ShortcutMod shortcut={itm} index={i} />
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