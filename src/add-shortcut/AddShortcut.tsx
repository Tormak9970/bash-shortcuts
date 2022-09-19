import { Field, ConfirmModal, PanelSection, PanelSectionRow, TextField } from "decky-frontend-lib"
import { VFC, Fragment, useState } from "react"
import { PyInterop } from "../PyInterop";
import { Shortcut } from "../Shortcut";

export function AddShortcut() {
    

  return (
      <>
          <div style={{
              marginBottom: "5px"
          }}>Here you can re-order or remove existing shortcuts</div>
          {/* @ts-ignore */}
          <PanelSection title="Your Shortcuts" style={{padding: "0px 0px"}}>
              {Object.values(shortcuts as ShortcutsDictionary).length > 0 ?
                  Object.values(shortcuts ? shortcuts : {})
                      .map((itm: Shortcut) => (
                      <ShortcutMod shortcut={itm} />
                  )) : (
                      <div style={{width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "5px"}}>
                          You don't have any shortcuts right now! You can create new shortcuts from the add menu to the left.
                      </div>
                  )
              }
              <PanelSectionRow>
                  <ButtonItem layout="below" onClick={reload} >
                      Reload Shortcuts
                  </ButtonItem>
              </PanelSectionRow>
          </PanelSection>
      </>
  );
}

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
    
    return (
        <>
            <ConfirmModal
            bAllowFullSize
            onCancel={closeModal}
            onEscKeypress={closeModal}
            
            onOK={() => {
                const updated = new Shortcut(shortcut.id, name, cmd);
                onConfirm(updated);
                closeModal();
            }}>
                <PanelSection title={title}>
                    <PanelSectionRow>
                        <Field
                            label="Shortcut Name"
                            description={
                                <TextField
                                    label={'Name'}
                                    value={name}
                                    onChange={(e) => setName(e?.target.value)}
                                />}
                            />
                    </PanelSectionRow>
                    <PanelSectionRow>
                        <Field
                            label="Shortcut Command"
                            description={
                                <TextField
                                    label={'Command'}
                                    value={cmd}
                                    onChange={(e) => setCmd(e?.target.value)}
                                />}
                            />
                    </PanelSectionRow>
                </PanelSection>
            </ConfirmModal>
        </>
    )
}