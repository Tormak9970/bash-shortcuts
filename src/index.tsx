import {
  ButtonItem,
  definePlugin,
  DialogButton,
  Menu,
  MenuItem,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  showContextMenu,
  staticClasses,
} from "decky-frontend-lib";
import { useState, VFC } from "react";
import { IoApps } from "react-icons/io5";
import { ShorcutList } from "./lib/ShortcutList";

import { PyInterop } from "./PyInterop";
import { Shortcut } from "./Shortcut";

type ShortcutsDictionary = {
  [key:string]: Shortcut
}

const Content: VFC<{ serverAPI: ServerAPI }> = ({}) => {
  const [shortcuts, setShortcuts] = useState<ShortcutsDictionary | undefined>();
  PyInterop.getShortcuts().then((res) => {
    setShortcuts(res.result as ShortcutsDictionary);
  });

  const onSave = async () => {
    const data = {...shortcuts};
    
    // add new shortcut to data
    // TODO: impliment


    const result = await PyInterop.setShortcuts(data);
    if (result.success) {
      setShortcuts(result.result);
    }
  };

  return (
    <PanelSection title="Shortcuts">
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => { Router.CloseSideMenus(); Router.Navigate("/decky-plugin-shortcuts-manage"); }} >
          Manage Shortcuts
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        {/* itterate over shortcuts and add them here */}
        <div style={{ margin: "20px 0px", width: "100%" }}>
          <ShorcutList shortcuts={shortcuts as ShortcutsDictionary} />
        </div>
      </PanelSectionRow>
    </PanelSection>
  );
};

const ManageShortcutsModal: VFC = () => {
  return (
    <div style={{ marginTop: "50px", color: "white" }}>
      Hello World!
      <DialogButton onClick={() => Router.NavigateToStore()}>
        Go to Store
      </DialogButton>
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute("/decky-plugin-shortcuts-manage", ManageShortcutsModal, {
    exact: true,
  });

  return {
    title: <div className={staticClasses.Title}>Shortcuts</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <IoApps />,
    onDismount() {
      serverApi.routerHook.removeRoute("/decky-plugin-shortcuts-manage");
    },
  };
});
