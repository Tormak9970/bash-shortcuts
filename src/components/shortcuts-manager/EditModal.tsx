import { Field, ConfirmModal, PanelSection, PanelSectionRow, TextField, ToggleField } from "decky-frontend-lib"
import { VFC, Fragment, useState, useEffect } from "react"
import { Shortcut } from "../../lib/data-structures/Shortcut"

type EditModalProps = {
    closeModal: () => void,
    onConfirm?(shortcut:Shortcut): any,
    title?: string,
    shortcut: Shortcut,
}

export const EditModal: VFC<EditModalProps> = ({
    closeModal,
    onConfirm = () => {},
    shortcut,
    title = `Modifying: ${shortcut.name}`,
}) => {
    const [name, setName] = useState<string>(shortcut.name);
    const [cmd, setCmd] = useState<string>(shortcut.cmd);
    const [isApp, setIsApp] = useState<boolean>(shortcut.isApp);

    useEffect(() => {
        console.log(isApp);
    }, [isApp])
    
    return (
        <>
            <ConfirmModal
            bAllowFullSize
            onCancel={closeModal}
            onEscKeypress={closeModal}
            
            onOK={() => {
                const updated = new Shortcut(shortcut.id, name, cmd, shortcut.position, isApp);
                onConfirm(updated);
                closeModal();
            }}>
                <PanelSection title={title}>
                    <PanelSectionRow>
                        <Field
                            label="Name"
                            description={
                                <TextField
                                    value={name}
                                    onChange={(e) => {setName(e?.target.value)}}
                                />}
                            />
                    </PanelSectionRow>
                    <PanelSectionRow>
                        <Field
                            label="Command"
                            description={
                                <TextField
                                    value={cmd}
                                    onChange={(e) => {setCmd(e?.target.value)}}
                                />}
                            />
                    </PanelSectionRow>
                    <PanelSectionRow>
                        <ToggleField label="Does this launch an app?" onChange={(e) => {setIsApp(e)}} checked={isApp} />
                    </PanelSectionRow>
                </PanelSection>
            </ConfirmModal>
        </>
    )
}