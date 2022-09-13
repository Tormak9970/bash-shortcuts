import {
  ButtonItem,
  definePlugin,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  SidebarNavigation,
  staticClasses,
} from "decky-frontend-lib";
import { useState, VFC } from "react";
import { IoApps } from "react-icons/io5";
import { About } from "./About";
import { AddShortcut } from "./AddShortcut";
import { ShorcutList } from "./lib/ShortcutList";
import { ManageShortcuts } from "./ManageShortcuts";

import { PyInterop } from "./PyInterop";
import { Shortcut } from "./Shortcut";

type ShortcutsDictionary = {
  [key:string]: Shortcut
}

const Content: VFC<{ serverAPI: ServerAPI }> = ({}) => {
  const [shortcuts, setShortcuts] = useState<ShortcutsDictionary | undefined>();
  
  PyInterop.getShortcuts().then((res) => {
    setShortcuts(res.result as ShortcutsDictionary);
    PyInterop.key = PyInterop.key == 0 ? 1 : 0;
  });

  return (
    <PanelSection title="Shortcuts">
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => { Router.CloseSideMenus(); Router.Navigate("/shortcuts/nav"); }} >
          Manage Shortcuts
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        {/* itterate over shortcuts and add them here */}
        <div style={{ margin: "20px 0px", width: "100%", padding: "0" }}>
          <ShorcutList key={PyInterop.key} shortcuts={shortcuts ? shortcuts : {}} />
        </div>
      </PanelSectionRow>
    </PanelSection>
  );
};

const ShortcutsManagerRouter: VFC = () => {
  return (
    <SidebarNavigation
      title="Shortcuts Manager"
      showTitle
      pages={[
        {
          title: "Add a Shortcut",
          content: <AddShortcut />,
          route: "/shortcuts/add",
        },
        {
          title: "Manage Shortcuts",
          content: <ManageShortcuts />,
          route: "/shortcuts/manage",
        },
        {
          title: "About Shortcuts",
          content: <About />,
          route: "/shortcuts/about",
        },
      ]}
    />
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  PyInterop.setServer(serverApi);
  serverApi.routerHook.addRoute("/shortcuts/nav", ShortcutsManagerRouter, {
    exact: true,
  });

  return {
    title: <div className={staticClasses.Title}>Shortcuts</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <IoApps />,
    onDismount() {
      serverApi.routerHook.removeRoute("/shortcuts/nav");
    },
  };
});
