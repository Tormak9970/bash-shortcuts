import { Field, ModalRoot, PanelSection, PanelSectionRow, TextField } from "decky-frontend-lib"
import { VFC, Fragment, useState } from "react"
import { Shortcut } from "../Shortcut"

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
    const [path, setPath] = useState<string>(shortcut.path);
    
    return (
        <>
            <ModalRoot
            bAllowFullSize
            onCancel={closeModal}
            onEscKeypress={closeModal}
            
            onOK={() => {
                const updated = new Shortcut(shortcut.id, name, path);
                onConfirm(updated);
                closeModal();
            }}>
                <PanelSection title={title}>
                    <PanelSectionRow>
                        <Field
                            label="Shortcut Name"
                            description={
                                <TextField label={'Name'}
                                    value={name}
                                    onChange={(e) => setName(e?.target.value)}
                                />}
                            />
                    </PanelSectionRow>
                    <PanelSectionRow>
                        <Field
                            label="Shortcut Path"
                            description={
                                <TextField
                                    label={'Path'}
                                    value={path}
                                    onChange={(e) => setPath(e?.target.value)}
                                />}
                            />
                    </PanelSectionRow>
                </PanelSection>
            </ModalRoot>
        </>
    )
}