import { Button, ButtonItem, ConfirmModal, DialogButton, Focusable, Menu, MenuItem, PanelSection, PanelSectionRow, showContextMenu, showModal } from "decky-frontend-lib";
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
    
    function ShortcutArrow(props: ShortcutModProps) {
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
                    `}
                </style>
                <PanelSectionRow>
                    <div className="custom-buttons">
                        <Focusable style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
						    {/* @ts-ignore */}
                            <DialogButton onClick={(e) => {}}>
                                <FaArrowsAltV />
                            </DialogButton>

                            <div style={{
                                flexGrow: "2",
                                marginLeft: "14px"
                            }}>{props.shortcut.name}</div>

                            {/* @ts-ignore */}
                            <DialogButton onClick={ (e) => showMenu(e, props.shortcut) }>
                                <FaEllipsisH />
                            </DialogButton>
                        </Focusable>
                    </div>
                </PanelSectionRow>
            </>
        );
    }
    function ShortcutElipsis(props: ShortcutModProps) {
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
                    `}
                </style>
                <PanelSectionRow>
                    <div className="custom-buttons">
                        <Focusable style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
						    {/* @ts-ignore */}
                            <DialogButton onClick={(e) => {}}>
                                <FaArrowsAltV />
                            </DialogButton>

                            <div style={{
                                flexGrow: "2",
                                marginLeft: "14px"
                            }}>{props.shortcut.name}</div>

                            {/* @ts-ignore */}
                            <DialogButton onClick={ (e) => showMenu(e, props.shortcut) }>
                                <FaEllipsisH />
                            </DialogButton>
                        </Focusable>
                    </div>
                </PanelSectionRow>
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
                .scoper .quickaccesscontrols_PanelSection_2C0g0 {
                    width: inherit;
                    height: inherit;
                    padding: 0px;
                }
                
                .scoper .DialogButton._DialogLayout.Secondary.gamepaddialog_Button_1kn70.Focusable {
                    min-width: 30px;
                    max-width: 60px;
                    display: flex;
                    justify-content: center,
                    align-items: center
                }

                .cols {

                }

                .col {

                }
            `}</style>
            <div style={{
                marginBottom: "5px"
            }}>Here you can re-order or remove existing shortcuts</div>
            <div className="scoper">
                <PanelSection title="Your Shortcuts">
                    {Object.values(shortcuts as ShortcutsDictionary).length > 0 ?
                        (
                            <PanelSectionRow>
                                <div className="cols">
                                    <Focusable>
                                        {Object.values(shortcuts ? shortcuts : {})
                                            .map((itm: Shortcut) => (
                                            // @ts-ignore
                                            <DialogButton onClick={(e) => {}}>
                                                <FaArrowsAltV />
                                            </DialogButton>
                                        ))}
                                    </Focusable>

                                    <div className="col">
                                        {Object.values(shortcuts ? shortcuts : {})
                                            .map((itm: Shortcut) => (
                                                <div style={{
                                                    flexGrow: "2",
                                                    marginLeft: "14px"
                                                }}>{itm.name}</div>
                                        ))}
                                    </div>

                                    <Focusable>
                                        {Object.values(shortcuts ? shortcuts : {})
                                            .map((itm: Shortcut) => (
                                            // @ts-ignore
                                            <DialogButton onClick={ (e) => showMenu(e, itm) }>
                                                <FaEllipsisH />
                                            </DialogButton>
                                        ))}
                                    </Focusable>
                                </div>
                            </PanelSectionRow>
                        ) : (
                            <div style={{width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "5px"}}>
                                You don't have any shortcuts right now! You can create new shortcuts from the add menu to the left.
                            </div>
                        )
                    }

                    <PanelSectionRow>
						{/* @ts-ignore */}
                        <ButtonItem layout="below" onClick={reload} bottomSeparator='none'>
                            Reload Shortcuts
                        </ButtonItem>
                    </PanelSectionRow>
                </PanelSection>
            </div>
        </>
    );
}