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

import logo from "../assets/logo.png";
import { PyInterop } from "./pyInterop";
import { Shortcut } from "./Shortcut";

type ShortcutsDictionary = {
  [key:string]: Shortcut
}

interface setShortcutsMethodArgs {
  shortcutsDict: ShortcutsDictionary
}

const Content: VFC<{ serverAPI: ServerAPI }> = ({}) => {
  const [shortcuts, setShortcuts] = useState<ShortcutsDictionary | undefined>();
  let sCuts = await PyInterop.getShortcuts();
  setShortcuts(sCuts);

  const onSave = async () => {
    const data = {...shortcuts};
    
    // add new shortcut to data
    // TODO: impliment


    const result = PyInterop.setShortcuts(data);
    if (result.success) {
      setShortcuts(result.result);
    }
  };

  return (
    <PanelSection title="Panel Section">
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={(e: MouseEvent) =>
            showContextMenu(
              <Menu label="Menu" cancelText="CAAAANCEL" onCancel={() => {}}>
                <MenuItem onSelected={() => {}}>Item #1</MenuItem>
                <MenuItem onSelected={() => {}}>Item #2</MenuItem>
                <MenuItem onSelected={() => {}}>Item #3</MenuItem>
              </Menu>,
              e.currentTarget ?? window
            )
          }
        >
          Server says yolo
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src={logo} />
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Router.CloseSideMenus();
            Router.Navigate("/decky-plugin-shortcuts");
          }}
        >
          Router
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

const DeckyPluginRouterTest: VFC = () => {
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
  serverApi.routerHook.addRoute("/decky-plugin-shortcuts", DeckyPluginRouterTest, {
    exact: true,
  });

  return {
    title: <div className={staticClasses.Title}>Shortcuts</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <IoApps />,
    onDismount() {
      serverApi.routerHook.removeRoute("/decky-plugin-shortcuts");
    },
  };
});
