import {
  DialogButton,
  Field,
  Focusable,
  Navigation,
  gamepadDialogClasses,
} from "decky-frontend-lib";
import { Fragment, VFC, useEffect, useState } from "react";
import { Shortcut } from "../lib/data-structures/Shortcut";

import { IoRocketSharp } from "react-icons/io5";
import { PyInterop } from "../PyInterop";
import { FaTrashAlt } from "react-icons/fa";
import { PluginController } from "../lib/controllers/PluginController";
import { useShortcutsState } from "../state/ShortcutsState";

export type ShortcutLauncherProps = {
  shortcut: Shortcut;
};

/**
 * A component for the label of a ShortcutLauncher.
 * @param props The props for this ShortcutLabel.
 * @returns A ShortcutLabel component.
 */
const ShortcutLabel: VFC<{ shortcut: Shortcut; isRunning: boolean }> = (props: {
  shortcut: Shortcut;
  isRunning: boolean;
}) => {
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
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <div>{props.shortcut.name}</div>
        <div
          style={{
            visibility: props.isRunning ? "visible" : "hidden",
            marginLeft: "7px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#36ff04",
            animation: "gradient 3s ease-in-out infinite",
          }}
        ></div>
      </div>
    </>
  );
};
/**
 * A component for launching shortcuts.
 * @param props The ShortcutLauncher's props.
 * @returns The ShortcutLauncher component.
 */
export const ShortcutLauncher: VFC<ShortcutLauncherProps> = (
  props: ShortcutLauncherProps,
) => {
  const { runningShortcuts, setIsRunning } = useShortcutsState();
  const [isRunning, _setIsRunning] = useState<boolean>(
    PluginController.checkIfRunning(props.shortcut.id),
  );

  useEffect(() => {
    if (
      PluginController.checkIfRunning(props.shortcut.id) &&
      !runningShortcuts.has(props.shortcut.id)
    ) {
      setIsRunning(props.shortcut.id, true);
    }
  }, []);

  useEffect(() => {
    _setIsRunning(runningShortcuts.has(props.shortcut.id));
  }, [runningShortcuts]);

  /**
   * Determines which action to run when the interactable is selected.
   * @param shortcut The shortcut associated with this shortcutLauncher.
   */
  async function onAction(shortcut: Shortcut): Promise<void> {
    if (isRunning) {
      const res = await PluginController.closeShortcut(shortcut);
      if (!res) {
        PyInterop.toast("Error", "Failed to close shortcut.");
      } else {
        setIsRunning(shortcut.id, false);
      }
    } else {
      const res = await PluginController.launchShortcut(shortcut, async () => {
        if (PluginController.checkIfRunning(shortcut.id) && shortcut.isApp) {
          setIsRunning(shortcut.id, false);
          const killRes = await PluginController.killShortcut(shortcut);
          if (killRes) {
            Navigation.Navigate("/library/home");
            Navigation.CloseSideMenus();
          } else {
            PyInterop.toast("Error", "Failed to kill shortcut.");
          }
        }
      });
      if (!res) {
        PyInterop.toast("Error", "Shortcut failed. Check the command.");
      } else {
        if (!shortcut.isApp) {
          PyInterop.log(
            `Registering for WebSocket messages of type: ${shortcut.id}...`,
          );

          PluginController.onWebSocketEvent(shortcut.id, (data: any) => {
            if (data.type == "end") {
              if (data.status == 0) {
                PyInterop.toast(shortcut.name, "Shortcut execution finished.");
              } else {
                PyInterop.toast(
                  shortcut.name,
                  "Shortcut execution was canceled.",
                );
              }

              setIsRunning(shortcut.id, false);
            }
          });
        }

        setIsRunning(shortcut.id, true);
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
        <Field
          label={
            <ShortcutLabel shortcut={props.shortcut} isRunning={isRunning} />
          }
        >
          <Focusable style={{ display: "flex", width: "100%" }}>
            <DialogButton
              onClick={() => onAction(props.shortcut)}
              style={{
                minWidth: "30px",
                maxWidth: "60px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {isRunning ? (
                <FaTrashAlt color="#e24a4a" />
              ) : (
                <IoRocketSharp color="#36ff04" />
              )}
            </DialogButton>
          </Focusable>
        </Field>
      </div>
    </>
  );
};
