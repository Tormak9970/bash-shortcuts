import { Router, ServerAPI } from "decky-frontend-lib";
import { PyInterop } from "../PyInterop";
import { Shortcut } from "./data-structures/Shortcut";
import { waitForServicesInitialized } from "./Services";
import { LifetimeNotification, SteamShortcut } from "./SteamClient";
import { SteamUtils } from "./SteamUtils";


export class ShortcutManager {
  static appId: number;

  private static server: ServerAPI;
  private static routePath = "/library/app/:appid";
  private static routerPatch: any;

  private static shortcutName: string;
  private static runnerPath = "\"/home/deck/homebrew/plugins/bash-shortcuts/shortcutsRunner.sh\"";
  private static startDir = "\"/home/deck/homebrew/plugins/bash-shortcuts/\"";

  private static hideShortcut = false;

  static setServer(server: ServerAPI) {
    this.server = server;
  }

  static initOnLogin() {
    PyInterop.getHomeDir().then((res) => {
      ShortcutManager.runnerPath = `\"/home/${res.result}/homebrew/plugins/bash-shortcuts/shortcutsRunner.sh\"`;
      ShortcutManager.startDir = `\"/home/${res.result}/homebrew/plugins/bash-shortcuts/\"`;
    });

    return SteamUtils.registerForAuthStateChange(async () => {
      if (await waitForServicesInitialized()) {
        ShortcutManager.init("Bash Shortcuts");
      } else {
        PyInterop.toast("Error", "Failed to initialize, try restarting.");
      }
    }, null, true);
  }

  static async init(name: string) {
    this.shortcutName = name;
    if (!(await this.checkShortcutExist(this.shortcutName))) {
      const success = await this.addShortcut(this.shortcutName, this.runnerPath, ShortcutManager.hideShortcut);

      if (!success) {
        PyInterop.log(`Failed to create shortcut during boot. [DEBUG INFO] appId: ${this.appId}; appName: ${name};`);
      }
    } else {
      const shorcuts = await SteamUtils.getShortcut(name) as SteamShortcut[];

      if (shorcuts.length > 1) {
        for (let i = 1; i < shorcuts.length; i++) {
          const s = shorcuts[i];
          const success = await SteamUtils.removeShortcut(s.appid);
          console.log(`Tried to delete a duplicate shortcut. [DEBUG INFO] appId: ${this.appId}; appName: ${name}; success: ${success};`);
          PyInterop.log(`Tried to delete a duplicate shortcut. [DEBUG INFO] appId: ${this.appId}; appName: ${name}; success: ${success};`);
        }
      }

      const shortcut = shorcuts[0];

      if (shortcut) {
        if (shortcut.data.strExePath != this.runnerPath) {
          const res = await SteamUtils.setShortcutExe(shortcut.appid, this.runnerPath);
          if (!res) {
            PyInterop.toast("Error", "Failed to set the shortcutsRunner path");
          }
        }
        // TODO these aren't ever equal. for now it works to confirm its correct by resetting it.
        if (shortcut.data.strShortcutPath != this.startDir) {
          const res = await SteamUtils.setShortcutStartDir(shortcut.appid, this.startDir);
          if (!res) {
            PyInterop.toast("Error", "Failed to set the start dir");
          }
        }
        this.appId = shortcut.appid;
      } else {
        PyInterop.toast("Error", "Failed to get shortcut but it exists. Please try restarting your Deck.");
      }
    }

    if (this.appId) {
      // this.routerPatch = this.server.routerHook.addPatch(this.routePath, (routeProps: { path: string; children: ReactElement }) => {
      //     afterPatch(routeProps.children.props, "renderFunc", (_args: any[], ret:ReactElement) => {
      //         const { appid } = ret.props.children.props.overview;

      //         if (appid === this.appId && this.redirectable) {
      //             console.log("rerouting");
      //             Router.NavigateBackOrOpenMenu();
      //             this.redirectable = false;
      //             setTimeout(() => {
      //                 this.redirectable = true;
      //             }, 500);
      //             return null;
      //         }

      //         return ret;
      //     });

      //     return routeProps;
      // });
    }
  }

  static onDismount() {
    if (this.routerPatch) {
      this.server.routerHook.removePatch(this.routePath, this.routerPatch);
    }
    PyInterop.log("Dismounting...");
  }

  static async getShortcuts() {
    const res = await SteamUtils.getShortcuts();
    return res;
  }

  static async launchShortcut(shortcut: Shortcut, setIsRunning: (value: boolean) => void): Promise<boolean> {
    if (!(await this.checkShortcutExist(this.shortcutName))) {
      const success = await this.addShortcut(this.shortcutName, this.runnerPath, ShortcutManager.hideShortcut);

      if (!success) {
        PyInterop.log("Failed to create shortcut, was missing when launch attempted.");
      }
    }
    if (shortcut.isApp) {
      const didSetLaunchOpts = await SteamUtils.setAppLaunchOptions(this.appId, shortcut.cmd);
      if (didSetLaunchOpts) {
        Router.CloseSideMenus();
        const didLaunch = await SteamUtils.runGame(this.appId, false);
        if (didLaunch) {
          Router.CloseSideMenus();
          setIsRunning(true);
        }
        const unregister = SteamUtils.registerForGameLifetime((data: LifetimeNotification) => {
          if (data.bRunning) return;
          setIsRunning(false);

          unregister();
        });

        return didLaunch;
      } else {
        PyInterop.toast("Error", "Failed at setAppLaunchOptions");
        setIsRunning(false);
        return false;
      }
    } else {
      const res = await PyInterop.runNonAppShortcut(shortcut);
      const status = typeof res.result == "boolean" && (res.result as boolean);
      if (status) {
        PyInterop.toast("Success", "Command exited successfully!");
      }
      return status;
    }
  }

  static async closeGame(): Promise<boolean> {
    Router.CloseSideMenus();
    const status = await SteamUtils.terminateGame(this.appId);
    return status;
  }

  private static async checkShortcutExist(name: string): Promise<boolean> {
    const shortcutsArr = await SteamUtils.getShortcut(name) as SteamShortcut[];
    return !!shortcutsArr[0]?.data;
  }

  private static async addShortcut(name: string, exec: string, hideShortcut: boolean): Promise<boolean> {
    const res = await SteamUtils.addShortcut(name, exec, hideShortcut);
    if (res) {
      this.appId = res as number;
      return true;
    } else {
      console.log("Failed to add shortcut.");
      PyInterop.toast("Error", "Failed to add shortcut");
      return false;
    }
  }

  // @ts-ignore
  private static async removeShortcut(name: string): Promise<boolean> {
    const shortcut = await SteamUtils.getShortcut(name)[0];
    if (shortcut) {
      return !!(await SteamUtils.removeShortcut(shortcut.appid));
    } else {
      console.log("Failed to remove shortcut.");
      PyInterop.toast("Error", "Failed to remove shortcut");
      return false;
    }
  }
}