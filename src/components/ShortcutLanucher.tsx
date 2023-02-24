import { DialogButton, Field, Focusable, gamepadDialogClasses } from "decky-frontend-lib";
import { Fragment } from "react";
import { Shortcut } from "../lib/data-structures/Shortcut";

import { IoRocketSharp } from "react-icons/io5";
import { ShortcutManager } from "../lib/ShortcutManager";
import { PyInterop } from "../PyInterop";
import { FaTrashAlt } from "react-icons/fa";

export type ShortcutLauncherProps = {
  shortcut: Shortcut
}

function ShortcutLabel(props: { shortcut: Shortcut }) {
  return (
    <>
      <style>{`
        @keyframes bash-shortcuts-running-shortcut-gradient {
          0% {
            background-color:  #36ff04;
          }
          50% {
            background-color: #00d836;
          }
          100% {
            background-color:  #36ff04;
          }
        }
      `}</style>
      <div style={{
        "height": "100%",
        "display": "flex",
        "flexDirection": "row",
        "alignItems": "center"
      }}>
        <div>{props.shortcut.name}</div>
        <div style={{
          "visibility": props.shortcut.isRunning ? "visible" : "hidden",
          "marginLeft": "7px",
          "width": "12px",
          "height": "12px",
          "borderRadius": "50%",
          "backgroundColor": "#36ff04",
          "animation": "gradient 3s ease-in-out infinite"
        }}></div>
      </div>
    </>
  );
}

export function ShortcutLauncher(props: ShortcutLauncherProps) {
  async function onAction(shortcut:Shortcut) {
    const isRunning = shortcut.isRunning;

    if (isRunning) {
      const res = await ShortcutManager.closeShortcut(shortcut);
      if (!res) {
        PyInterop.toast("Error", "Shortcut failed. Check the command.");
      }
    } else {
      const res = await ShortcutManager.launchShortcut(shortcut);
      if (!res) {
        PyInterop.toast("Error", "Shortcut failed. Check the command.");
      }
    }
  }

  return (
    <>
      <style>
        {`
          .custom-buttons {
            width: inherit;
            height: inherit;
            display: inherit;
          }

          .custom-buttons .${gamepadDialogClasses.FieldChildren} {
            margin: 0px 16px;
          }
      `}
      </style>
      <div className="custom-buttons">
        <Field label={<ShortcutLabel shortcut={props.shortcut} />}>
          <Focusable style={{ display: "flex", width: "100%" }}>
            <DialogButton onClick={() => onAction(props.shortcut)} style={{
              minWidth: "30px",
              maxWidth: "60px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
              { (props.shortcut.isRunning) ? <FaTrashAlt color="#e24a4a" /> : <IoRocketSharp color="#36ff04" /> }
            </DialogButton>
          </Focusable>
        </Field>
      </div>
    </>
  );
}