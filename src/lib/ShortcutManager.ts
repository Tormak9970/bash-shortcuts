import { Router, ServerAPI } from "decky-frontend-lib";
import { PyInterop } from "../PyInterop";
import { Shortcut } from "./data-structures/Shortcut";
import { waitForServicesInitialized } from "./Services";
import { SteamUtils } from "./SteamUtils";


export class ShortcutManager {
  static appId: number;

  // @ts-ignore
  private static server: ServerAPI;

  private static shortcutName: string;
  private static runnerPath = "\"/home/deck/homebrew/plugins/bash-shortcuts/shortcutsRunner.sh\"";
  private static startDir = "\"/home/deck/homebrew/plugins/bash-shortcuts/\"";

  /**
   * Sets the plugin's serverAPI.
   * @param server The serverAPI to use.
   */
  static setServer(server: ServerAPI) {
    this.server = server;
  }

  /**
   * Sets the plugin to initialize once the user logs in.
   * @returns The unregister function for the login hook.
   */
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

  /**
   * Initializes the Plugin.
   * @param name The name of the main shortcut.
   */
  static async init(name: string) {
    this.shortcutName = name;
    if (!(await this.checkShortcutExist(this.shortcutName))) {
      const success = await this.addShortcut(this.shortcutName, this.runnerPath);

      if (!success) {
        PyInterop.log(`Failed to create shortcut during boot. [DEBUG INFO] appId: ${this.appId}; appName: ${name};`);
      }
    } else {
      const shorcuts = await SteamUtils.getShortcut(name) as SteamAppDetails[];

      if (shorcuts.length > 1) {
        for (let i = 1; i < shorcuts.length; i++) {
          const s = shorcuts[i];
          const success = await SteamUtils.removeShortcut(s.unAppID);
          PyInterop.log(`Tried to delete a duplicate shortcut. [DEBUG INFO] appId: ${this.appId}; appName: ${name}; success: ${success};`);
        }
      }

      const shortcut = shorcuts[0];

      if (shortcut) {
        if (shortcut.strShortcutExe != this.runnerPath) {
          const res = await SteamUtils.setShortcutExe(shortcut.unAppID, this.runnerPath);
          if (!res) {
            PyInterop.toast("Error", "Failed to set the shortcutsRunner path");
          }
        }
        
        if (shortcut.strShortcutStartDir != this.startDir) {
          const res = await SteamUtils.setShortcutStartDir(shortcut.unAppID, this.startDir);
          if (!res) {
            PyInterop.toast("Error", "Failed to set the start dir");
          }
        }
        this.appId = shortcut.unAppID;
      } else {
        PyInterop.toast("Error", "Failed to get shortcut but it exists. Please try restarting your Deck.");
      }
    }
  }

  /**
   * Function to run when the plugin dismounts.
   */
  static onDismount() {
    PyInterop.log("Dismounting...");
  }

  /**
   * Gets all of the current user's steam shortcuts.
   * @returns A promise resolving to a collection of the current user's steam shortcuts.
   */
  static async getShortcuts(): Promise<SteamAppDetails[]> {
    const res = await SteamUtils.getShortcuts();
    return res;
  }

  /**
   * Launches a steam shortcut.
   * @param shortcut The shortcut to launch.
   * @returns A promise resolving to true if the shortcut was successfully launched.
   */
  static async launchShortcut(shortcut: Shortcut): Promise<boolean> {
    if (!(await this.checkShortcutExist(this.shortcutName))) {
      const success = await this.addShortcut(this.shortcutName, this.runnerPath);

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
          shortcut.isRunning = true;
          await PyInterop.setShortcutIsRunning(shortcut);
        }
        const unregister = SteamUtils.registerForGameLifetime(this.appId, (data: LifetimeNotification) => {
          if (data.bRunning) return;
          shortcut.isRunning = false;
          PyInterop.setShortcutIsRunning(shortcut);

          unregister();
        });

        return didLaunch;
      } else {
        PyInterop.toast("Error", "Failed at setAppLaunchOptions");
        shortcut.isRunning = false;
        await PyInterop.setShortcutIsRunning(shortcut);
        return false;
      }
    } else {
      const res = await PyInterop.runNonAppShortcut(shortcut);
      const status = typeof res.result == "boolean" && (res.result as boolean);
      if (status) {
        shortcut.isRunning = true;
        
        PyInterop.toast("Success", "Command exited successfully!");
      }
      return status;
    }
  }

  /**
   * Closes a running shortcut.
   * @param shortcut The shortcut to close.
   * @returns A promise resolving to true if the shortcut was successfully closed.
   */
  static async closeShortcut(shortcut:Shortcut): Promise<boolean> {
    let status: boolean;

    if (shortcut.isApp) {
      status = await SteamUtils.terminateGame(this.appId);
      if (status) {
        Router.CloseSideMenus();
        shortcut.isRunning = false;
        await PyInterop.setShortcutIsRunning(shortcut);
      } else {
        PyInterop.log(`Failed to close shortcut ${shortcut.name}`);
        PyInterop.toast("Error", "Failed to close the shortcut");
      }
    } else {
      status = false;
    }

    return status;
  }

  /**
   * Checks if a shortcut exists.
   * @param name The name of the shortcut to check for.
   * @returns A promise resolving to true if the shortcut was found.
   */
  private static async checkShortcutExist(name: string): Promise<boolean> {
    const shortcutsArr = await SteamUtils.getShortcut(name) as SteamAppDetails[];
    return shortcutsArr[0]?.unAppID != 0;
  }

  /**
   * Creates a new steam shortcut.
   * @param name The name of the shortcut to create.
   * @param exec The executable file for the shortcut.
   * @returns A promise resolving to true if the shortcut was successfully created.
   */
  private static async addShortcut(name: string, exec: string): Promise<boolean> {
    const res = await SteamUtils.addShortcut(name, exec);
    if (res) {
      this.appId = res as number;
      return true;
    } else {
      PyInterop.log(`Failed to add shortcut. Name: ${name}`);
      PyInterop.toast("Error", "Failed to add shortcut");
      return false;
    }
  }

  /**
   * Deletes a shortcut from steam.
   * @param name Name of the shortcut to delete.
   * @returns A promise resolving to true if the shortcut was successfully deleted.
   */
  // @ts-ignore
  private static async removeShortcut(name: string): Promise<boolean> {
    const shortcut = await SteamUtils.getShortcut(name)[0] as SteamAppDetails;
    if (shortcut) {
      return await SteamUtils.removeShortcut(shortcut.unAppID);
    } else {
      PyInterop.log(`Didn't find shortcut to remove. Name: ${name}`);
      PyInterop.toast("Error", "Didn't find shortcut to remove.");
      return false;
    }
  }
}