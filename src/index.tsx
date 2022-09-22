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
import { VFC, Fragment } from "react";
import { IoApps } from "react-icons/io5";
import { About } from "./shortcuts-manager/About";
import { AddShortcut } from "./shortcuts-manager/AddShortcut";
import { ShortcutLauncher } from "./components/ShortcutLanucher";
import { ManageShortcuts } from "./shortcuts-manager/ManageShortcuts";

import { PyInterop } from "./PyInterop";
import { Shortcut } from "./Shortcut";
import { ShortcutsContextProvider, ShortcutsState, useShortcutsState } from "./state/ShortcutsState";

type ShortcutsDictionary = {
  [key:string]: Shortcut
}

const Content: VFC<{ serverAPI: ServerAPI }> = ({}) => {
  const {shortcuts, setShortcuts, shortcutsList} = useShortcutsState();

  async function reload() {
    await PyInterop.getShortcuts().then((res) => {
      setShortcuts(res.result as ShortcutsDictionary);
    });
  }
  
  if (Object.values(shortcuts as ShortcutsDictionary).length == 0) {
    reload();
  }

  return (
    <>
      <style>{`
        .scope {
          width: inherit;
          height: inherit;
          display: inherit;

          flex: 1 1 1px;
          min-height: 1px;
          scroll-padding: 48px 0px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-content: stretch;
        }
        .scope .quickaccesscontrols_PanelSection_2C0g0 {
          padding: 0px;
        }

        .scope .gamepaddialog_FieldChildren_14_HB {
          margin: 0px 16px;
        }
        
        .scope .gamepaddialog_FieldLabel_3b0U- {
          margin-left: 16px;
        }
      `}</style>
      <div className="scope">
        <PanelSection>
          <PanelSectionRow>
            <ButtonItem layout="below" onClick={() => { Router.CloseSideMenus(); Router.Navigate("/shortcuts-nav"); }} >
              Manage Shortcuts
            </ButtonItem>
          </PanelSectionRow>
    
          {shortcutsList.map((itm: Shortcut) => (
              <ShortcutLauncher shortcut={itm} />
          ))}
    
          <PanelSectionRow>
            <ButtonItem layout="below" onClick={reload} >
              Reload
            </ButtonItem>
          </PanelSectionRow>
        </PanelSection>
      </div>
    </>
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

  const state = new ShortcutsState();

  serverApi.routerHook.addRoute("/shortcuts-nav", () => (
    <ShortcutsContextProvider shortcutsStateClass={state}>
      <ShortcutsManagerRouter />
    </ShortcutsContextProvider>
  ));

  return {
    title: <div className={staticClasses.Title}>Shortcuts</div>,
    content: (
      <ShortcutsContextProvider shortcutsStateClass={state}>
        <Content serverAPI={serverApi} />
      </ShortcutsContextProvider>
    ),
    icon: <IoApps />,
    onDismount() {
      serverApi.routerHook.removeRoute("/shortcuts-nav");
    },
  };
});
