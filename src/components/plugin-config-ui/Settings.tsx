import { Field, PanelSection, PanelSectionRow, quickAccessControlsClasses, TextField } from "decky-frontend-lib";
import { VFC, Fragment } from "react";
import { PyInterop } from "../../PyInterop";
import { useSetting } from "./utils/hooks/useSetting";

type SettingField = {
  title: string,
  shortTitle: string,
  settingsKey: string,
  default: string,
  description: string,
  validator: (newVal: string) => boolean,
  mustBeNumeric?: boolean
}

type SettingsFieldProps = {
  field: SettingField
}

const SettingsField: VFC<SettingsFieldProps> = ({ field }) => {
  const [ setting, setSetting ] = useSetting<string>(field.settingsKey, field.default);

  const onChange = async (event: any) => {
    const newVal = event.target.value;
    
    PyInterop.log(`Checking newVal for ${field.settingsKey}. Result was: ${field.validator(newVal)} for value ${newVal}`);
    if (field.validator(newVal)) {
      await setSetting(newVal);
      PyInterop.log(`Set value of setting ${field.settingsKey} to ${newVal}`);
    } else {
      PyInterop.log(`Resetting value of setting ${field.settingsKey} to ${setting}`);
      event.target.value = setting;
    }
  }

  return (
    <TextField label={field.shortTitle} value={setting} onChange={onChange} description={field.description} mustBeNumeric={field.mustBeNumeric} />
  );
}

export const Settings: VFC<{}> = ({}) => {
  const fields = [
    {
      title: "WebSocket Port",
      shortTitle: "Port",
      settingsKey: "webSocketPort",
      default: "",
      description: "Set the port the WebSocket uses. Change requires a restart to take effect.",
      validator: (newVal: string) => newVal.length == 4,
      mustBeNumeric: true
    }
  ];

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
          {fields.map((field) => (
            <PanelSectionRow>
              <Field label={field.title} description={ <SettingsField field={field} /> } />
            </PanelSectionRow>
          ))}
        </PanelSection>
      </div>
    </>
  )
}