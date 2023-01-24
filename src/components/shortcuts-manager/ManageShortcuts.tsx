import { ConfirmModal, showModal } from "decky-frontend-lib";
import { Fragment, useRef } from "react";
import { PyInterop } from "../../PyInterop";
import { Shortcut } from "../../lib/data-structures/Shortcut";

import { EditModal } from "./EditModal";
import { useShortcutsState } from "../../state/ShortcutsState";
import { ReorderableEntry, ReorderableList } from "../utils/ReorderableList";
import { Menu, MenuItem, showContextMenu } from "./MenuProxy";

type ShortcutsDictionary = {
  [key: string]: Shortcut
}

export function ManageShortcuts() {
  const { shortcuts, setShortcuts, shortcutsList, reorderableShortcuts } = useShortcutsState();
  const tries = useRef(0);

  async function reload() {
    console.log("Reloading...");
    await PyInterop.getShortcuts().then((res) => {
      setShortcuts(res.result as ShortcutsDictionary);
    });
  }

  const reloadData = { "showReload": true, "reload": reload, "reloadLabel": "Shortcuts" };
  function onUpdate(data: ShortcutsDictionary) {
    setShortcuts(data);
    PyInterop.setShortcuts(shortcutsList);
  }

  function action(e: MouseEvent, data: ReorderableEntry<Shortcut>) {
    console.log(e, data);
    const shortcut = data.data;
    showContextMenu(
      <Menu label="Actions">
        <MenuItem onSelected={() => {
          showModal(
            // @ts-ignore
            <EditModal onConfirm={(updated: Shortcut) => {
              PyInterop.modShortcut(updated);
              let shorts = shortcuts;
              shorts[shortcut.id] = updated;
              setShortcuts(shorts);
            }} shortcut={shortcut} />
          );
        }}>Edit</MenuItem>
        <MenuItem onSelected={() => {
          showModal(
            <ConfirmModal onOK={() => {
              PyInterop.remShortcut(shortcut);
              let shorts = shortcuts;
              delete shorts[shortcut.id];
              setShortcuts(shorts);
            }} bDestructiveWarning={true}>
              Are you sure you want to delete this shortcut?
            </ConfirmModal>
          );
        }}>Delete</MenuItem>
      </Menu>,
      e.currentTarget ?? window
    );
  }

  if (shortcutsList.length === 0 && tries.current < 10) {
    reload();
    tries.current++;
  }

  return (
    <>
      <div style={{
        marginBottom: "5px"
      }}>Here you can re-order or remove existing shortcuts</div>
      {shortcutsList.length > 0 ? (
        <ReorderableList<Shortcut> data={reorderableShortcuts} reloadData={reloadData} action={action} onUpdate={onUpdate} />
      ) : (
        <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "5px" }}>
          Loading...
        </div>
      )
      }
    </>
  );
}