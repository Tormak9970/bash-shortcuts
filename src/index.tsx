import {
  ButtonItem,
  definePlugin,
  gamepadDialogClasses,
  Navigation,
  PanelSection,
  PanelSectionRow,
  quickAccessControlsClasses,
  ServerAPI,
  SidebarNavigation,
  staticClasses,
} from "decky-frontend-lib";
import { VFC, Fragment, useRef } from "react";
import { IoApps } from "react-icons/io5";
import { About } from "./components/plugin-config-ui/About";
import { AddShortcut } from "./components/plugin-config-ui/AddShortcut";
import { ShortcutLauncher } from "./components/ShortcutLanucher";
import { ManageShortcuts } from "./components/plugin-config-ui/ManageShortcuts";

import { PyInterop } from "./PyInterop";
import { Shortcut } from "./lib/data-structures/Shortcut";
import { ShortcutsContextProvider, ShortcutsState, useShortcutsState } from "./state/ShortcutsState";
import { PluginController } from "./lib/controllers/PluginController";

declare global {
  var SteamClient: SteamClient;
  var collectionStore: CollectionStore;
  var appStore: any;
}

const Content: VFC<{ serverAPI: ServerAPI }> = ({ }) => {
  const { shortcuts, setShortcuts, shortcutsList } = useShortcutsState();
  const tries = useRef(0);

  async function reload(): Promise<void> {
    await PyInterop.getShortcuts().then((res) => {
      setShortcuts(res.result as ShortcutsDictionary);
    });
  }

  if (Object.values(shortcuts as ShortcutsDictionary).length === 0 && tries.current < 10) {
    reload();
    tries.current++;
  }

  return (
    <>
      <style>{`
        .bash-shortcuts-scope {
          width: inherit;
          height: inherit;

          flex: 1 1 1px;
          scroll-padding: 48px 0px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-content: stretch;
        }
        .bash-shortcuts-scope .${quickAccessControlsClasses.PanelSection} {
          padding: 0px;
        }

        .bash-shortcuts-scope .${gamepadDialogClasses.FieldChildren} {
          margin: 0px 16px;
        }
        
        .bash-shortcuts-scope .${gamepadDialogClasses.FieldLabel} {
          margin-left: 16px;
        }
      `}</style>
      <div className="bash-shortcuts-scope">
        <PanelSection>
          <PanelSectionRow>
            <ButtonItem layout="below" onClick={() => { Navigation.CloseSideMenus(); Navigation.Navigate("/bash-shortcuts-nav"); }} >
              Plugin Config
            </ButtonItem>
          </PanelSectionRow>
          {
            (shortcutsList.length == 0) ? (
              <div style={{ textAlign: "center", margin: "14px 0px", padding: "0px 15px", fontSize: "18px" }}>No shortcuts found</div>
            ) : (
              <>
                {
                  shortcutsList.map((itm: Shortcut) => (
                    <ShortcutLauncher shortcut={itm} />
                  ))
                }
                <PanelSectionRow>
                  <ButtonItem layout="below" onClick={reload} >
                    Reload
                  </ButtonItem>
                </PanelSectionRow>
              </>
            )
          }
        </PanelSection>
      </div>
    </>
  );
};

const ShortcutsManagerRouter: VFC = () => {
  return (
    <SidebarNavigation
      title="Plugin Config"
      showTitle
      pages={[
        {
          title: "Add a Shortcut",
          content: <AddShortcut />,
          route: "/bash-shortcuts-nav/add",
        },
        {
          title: "Manage Shortcuts",
          content: <ManageShortcuts />,
          route: "/bash-shortcuts-nav/manage",
        },
        {
          title: "About",
          content: <About />,
          route: "/bash-shortcuts-nav/about",
        },
      ]}
    />
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  PyInterop.setServer(serverApi);

  const state = new ShortcutsState();
  PluginController.setup(serverApi);

  const loginHook = PluginController.initOnLogin();

  serverApi.routerHook.addRoute("/bash-shortcuts-nav", () => (
    <ShortcutsContextProvider shortcutsStateClass={state}>
      <ShortcutsManagerRouter />
    </ShortcutsContextProvider>
  ));

  // const guidePages: GuidePages = 
  PyInterop.getGuides().then(res => {
    console.log("Guides:", res);
  })

  return {
    title: <div className={staticClasses.Title}>Bash Shortcuts</div>,
    content: (
      <ShortcutsContextProvider shortcutsStateClass={state}>
        <Content serverAPI={serverApi} />
      </ShortcutsContextProvider>
    ),
    icon: <IoApps />,
    onDismount() {
      loginHook.unregister();
      serverApi.routerHook.removeRoute("/bash-shortcuts-nav");
      PluginController.onDismount();
    },
    alwaysRender: true
  };
});
