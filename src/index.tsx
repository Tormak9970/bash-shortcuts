import {
  ButtonItem,
  definePlugin,
  DialogButton,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
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
  let key = 0;
  PyInterop.getShortcuts().then((res) => {
    setShortcuts(res.result as ShortcutsDictionary);
    key = key == 0 ? 1 : 0;
  });

  const onSave = async () => {
    const data = {...shortcuts};
    
    // add new shortcut to data
    // TODO: impliment


    const result = await PyInterop.setShortcuts(data);
    if (result.success) {
      setShortcuts(result.result);
      key = key == 0 ? 1 : 0;
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
        <div style={{ margin: "20px 0px", width: "100%", padding: "0" }}>
          <ShorcutList key={key} shortcuts={shortcuts ? shortcuts : {}} />
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
  PyInterop.setServer(serverApi);
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
