import {
  ButtonItem,
  definePlugin,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  SidebarNavigation,
  Spinner,
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
  const [loading, setLoading] = useState<boolean>();
  setLoading(true);

  function reload() {
    setLoading(true);
    PyInterop.getShortcuts().then((res) => {
      setShortcuts(res.result as ShortcutsDictionary);
      PyInterop.key = PyInterop.key == 0 ? 1 : 0;
      setLoading(false);
    });
    //setShortcuts({"fcba1cb4-4601-45d8-b919-515d152c56ef": new Shortcut("fcba1cb4-4601-45d8-b919-515d152c56ef", "Konsole", "/home/deck/share/icons/breeze-dark/apps/utilities-terminal.svg", "/home/deck/share/applications/org.kde.konsole.desktop")})
  }
  
  reload();

  return (
    <PanelSection title="Shortcuts">
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => { Router.CloseSideMenus(); Router.Navigate("/shortcuts-nav"); }} >
          Manage Shortcuts
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        {
        loading ? 
          <Spinner style={{height: "60px", width: "60px"}} /> : 
          <div style={{ margin: "20px 0px", width: "100%", padding: "0" }}>
            <ShorcutList key={PyInterop.key} shortcuts={shortcuts ? shortcuts : {}} />
          </div>
        }
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem layout="below" onClick={reload} >
          Reload
        </ButtonItem>
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
          route: "/shortcuts-nav/add",
        },
        {
          title: "Manage Shortcuts",
          content: <ManageShortcuts />,
          route: "/shortcuts-nav/manage",
        },
        {
          title: "About Shortcuts",
          content: <About />,
          route: "/shortcuts-nav/about",
        },
      ]}
    />
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  PyInterop.setServer(serverApi);
  serverApi.routerHook.addRoute("/shortcuts-nav", ShortcutsManagerRouter);
  serverApi.routerHook.addRoute("/shortcuts-nav/add", AddShortcut);
  serverApi.routerHook.addRoute("/shortcuts-nav/manage", ManageShortcuts);
  serverApi.routerHook.addRoute("/shortcuts-nav/about", About);

  return {
    title: <div className={staticClasses.Title}>Shortcuts</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <IoApps />,
    onDismount() {
      serverApi.routerHook.removeRoute("/shortcuts-nav");
      serverApi.routerHook.removeRoute("/shortcuts-nav/add");
      serverApi.routerHook.removeRoute("/shortcuts-nav/manage");
      serverApi.routerHook.removeRoute("/shortcuts-nav/about");
    },
  };
});
