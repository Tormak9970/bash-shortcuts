import { Field, PanelSection, PanelSectionRow, TextField, ButtonItem, quickAccessControlsClasses, ToggleField, DropdownOption } from "decky-frontend-lib"
import { Fragment, useState, useEffect, VFC } from "react"
import { PyInterop } from "../../PyInterop";
import { Shortcut } from "../../lib/data-structures/Shortcut";

import { v4 as uuidv4 } from "uuid";
import { useShortcutsState } from "../../state/ShortcutsState";
import { Hook, hookAsOptions } from "../../lib/controllers/HookController";
import { MultiSelect } from "./utils/MultiSelect";
import { PluginController } from "../../lib/controllers/PluginController";

/**
 * Component for adding a shortcut to the plugin.
 * @returns An AddShortcut component.
 */
export const AddShortcut: VFC = () => {
  const { shortcuts, setShortcuts, shortcutsList } = useShortcutsState();
  const [ ableToSave, setAbleToSave ] = useState(false);
  const [ name, setName ] = useState<string>("");
  const [ cmd, setCmd ] = useState<string>("");
  const [ isApp, setIsApp ] = useState<boolean>(true);
  const [ passFlags, setPassFlags ] = useState<boolean>(false);
  const [ hooks, setHooks ] = useState<Hook[]>([]);

  function saveShortcut() {
    const newShort = new Shortcut(uuidv4(), name, cmd, shortcutsList.length + 1, isApp, passFlags, hooks);
    PyInterop.addShortcut(newShort);
    PluginController.updateHooks(newShort);
    setName("");
    setCmd("");
    PyInterop.toast("Success", "Shortcut Saved!");

    const ref = { ...shortcuts };
    ref[newShort.id] = newShort;
    setShortcuts(ref);
  }

  useEffect(() => {
    setAbleToSave(name != "" && cmd != "");
  }, [name, cmd])

  return (
    <>
      <style>{`
          .bash-shortcuts-scoper .${quickAccessControlsClasses.PanelSection} {
            width: inherit;
            height: inherit;
            padding: 0px;
          }
        `}</style>
      <div className="bash-shortcuts-scoper">
        <PanelSection>
          <PanelSectionRow>
            <Field
              label="Shortcut Name"
              description={
                <TextField
                  label={'Name'}
                  value={name}
                  onChange={(e) => { setName(e?.target.value); }}
                />
              }
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <Field
              label="Shortcut Command"
              description={
                <TextField
                  label={'Command'}
                  value={cmd}
                  onChange={(e) => { setCmd(e?.target.value); }}
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
              onChange={(e) => { setPassFlags(e); }}
              checked={passFlags}
              disabled={isApp}
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <Field 
              label="Hooks"
              description={
                <MultiSelect
                  label="Select a hook"
                  options={hookAsOptions}
                  selected={[]}
                  onChange={(selected:DropdownOption[]) => { setHooks(selected.map((s) => s.label as Hook)) }}
                />
              }
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <ButtonItem layout="below" onClick={saveShortcut} disabled={!ableToSave} bottomSeparator='none'>
              Save
            </ButtonItem>
          </PanelSectionRow>
        </PanelSection>
      </div>
    </>
  );
}