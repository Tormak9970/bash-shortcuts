import {
  Field,
  ConfirmModal,
  PanelSection,
  PanelSectionRow,
  TextField,
  ToggleField,
  DropdownOption,
} from "decky-frontend-lib";
import { VFC, Fragment, useState } from "react";
import { Shortcut } from "../../lib/data-structures/Shortcut";
import { MultiSelect } from "./utils/MultiSelect";
import { Hook, hookAsOptions } from "../../lib/controllers/HookController";

type EditModalProps = {
  closeModal: () => void;
  onConfirm?(shortcut: Shortcut): any;
  title?: string;
  shortcut: Shortcut;
};

/**
 * Component for the edit shortcut modal.
 * @param props The EditModalProps for this component.
 * @returns An EditModal component.
 */
export const EditModal: VFC<EditModalProps> = ({
  closeModal,
  onConfirm = () => {},
  shortcut,
  title = `Modifying: ${shortcut.name}`,
}) => {
  const [name, setName] = useState<string>(shortcut.name);
  const [cmd, setCmd] = useState<string>(shortcut.cmd);
  const [isApp, setIsApp] = useState<boolean>(shortcut.isApp);
  const [passFlags, setPassFlags] = useState<boolean>(shortcut.passFlags);
  const [hooks, setHooks] = useState<Hook[]>(shortcut.hooks);

  return (
    <>
      <ConfirmModal
        bAllowFullSize
        onCancel={closeModal}
        onEscKeypress={closeModal}
        onOK={() => {
          const updated = new Shortcut(
            shortcut.id,
            name,
            cmd,
            shortcut.position,
            isApp,
            passFlags,
            hooks,
          );
          onConfirm(updated);
          closeModal();
        }}
      >
        <PanelSection title={title}>
          <PanelSectionRow>
            <Field
              label="Name"
              description={
                <TextField
                  value={name}
                  onChange={(e) => {
                    setName(e?.target.value);
                  }}
                />
              }
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <Field
              label="Command"
              description={
                <TextField
                  value={cmd}
                  onChange={(e) => {
                    setCmd(e?.target.value);
                  }}
                />
              }
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <ToggleField
              label="Does this launch an app?"
              onChange={(e) => {
                setIsApp(e);
                if (e) setPassFlags(false);
              }}
              checked={isApp}
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <ToggleField
              label="Does this shortcut use flags?"
              onChange={(e) => {
                setPassFlags(e);
              }}
              checked={passFlags}
              disabled={isApp}
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <Field
              label="Hooks"
              highlightOnFocus={false}
              description={
                <MultiSelect
                  label="Select a hook"
                  options={hookAsOptions}
                  selected={hookAsOptions.filter((hookOpt) =>
                    hooks.includes(hookOpt.label),
                  )}
                  onChange={(selected: DropdownOption[]) => {
                    setHooks(selected.map((s) => s.label as Hook));
                  }}
                />
              }
            />
          </PanelSectionRow>
        </PanelSection>
      </ConfirmModal>
    </>
  );
};
