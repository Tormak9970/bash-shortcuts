import { PyInterop } from "../../PyInterop";
import { SteamController } from "./SteamController";

/**
 * Controller class for shortcuts.
 */
export class ShortcutsController {
  private steamController: SteamController;

  /**
   * Creates a new ShortcutsController.
   * @param steamController The SteamController used by this class.
   */
  constructor(steamController: SteamController) {
    this.steamController = steamController;
  }

  /**
   * Function to run when the plugin dismounts.
   */
  onDismount(): void {
    PyInterop.log("Dismounting...");
  }

  /**
   * Gets all of the current user's steam shortcuts.
   * @returns A promise resolving to a collection of the current user's steam shortcuts.
   */
  async getShortcuts(): Promise<SteamAppDetails[]> {
    const res = await this.steamController.getShortcuts();
    return res;
  }

  /**
   * Gets the current user's steam shortcut with the given name.
   * @param name The name of the shortcut to get.
   * @returns A promise resolving to the shortcut with the provided name, or null.
   */
  async getShortcut(name: string): Promise<SteamAppDetails | null> {
    const res = await this.steamController.getShortcut(name);

    if (res) {
      return res[0];
    } else {
      return null;
    }
  }

  /**
   * Checks if a shortcut exists.
   * @param name The name of the shortcut to check for.
   * @returns A promise resolving to true if the shortcut was found.
   */
  async checkShortcutExist(name: string): Promise<boolean> {
    const shortcutsArr = await this.steamController.getShortcut(name) as SteamAppDetails[];
    return shortcutsArr.length > 0;
  }

  /**
   * Checks if a shortcut exists.
   * @param appId The id of the shortcut to check for.
   * @returns A promise resolving to true if the shortcut was found.
   */
  async checkShortcutExistById(appId: number): Promise<boolean> {
    const shortcutsArr = await this.steamController.getShortcutById(appId) as SteamAppDetails[];
    return shortcutsArr[0]?.unAppID != 0;
  }

  /**
   * Sets the exe of a steam shortcut.
   * @param appId The id of the app to set.
   * @param exec The new value for the exe.
   * @returns A promise resolving to true if the exe was set successfully.
   */
  async setShortcutExe(appId: number, exec: string): Promise<boolean> {
    return await this.steamController.setShortcutExe(appId, exec);
  }

  /**
   * Sets the start dir of a steam shortcut.
   * @param appId The id of the app to set.
   * @param startDir The new value for the start dir.
   * @returns A promise resolving to true if the start dir was set successfully.
   */
  async setShortcutStartDir(appId: number, startDir: string): Promise<boolean> {
    return await this.steamController.setShortcutStartDir(appId, startDir);
  }

  /**
   * Sets the launch options of a steam shortcut.
   * @param appId The id of the app to set.
   * @param launchOpts The new value for the launch options.
   * @returns A promise resolving to true if the launch options was set successfully.
   */
  async setShortcutLaunchOptions(appId: number, launchOpts: string): Promise<boolean> {
    return await this.steamController.setAppLaunchOptions(appId, launchOpts);
  }

  /**
   * Sets the name of a steam shortcut.
   * @param appId The id of the app to set.
   * @param newName The new name for the shortcut.
   * @returns A promise resolving to true if the name was set successfully.
   */
  async setShortcutName(appId: number, newName: string): Promise<boolean> {
    return await this.steamController.setShortcutName(appId, newName);
  }

  /**
   * Launches a steam shortcut.
   * @param appId The id of the steam shortcut to launch.
   * @returns A promise resolving to true if the shortcut was successfully launched.
   */
  async launchShortcut(appId: number): Promise<boolean> {
    return await this.steamController.runGame(appId, false);
  }

  /**
   * Closes a running shortcut.
   * @param appId The id of the shortcut to close.
   * @returns A promise resolving to true if the shortcut was successfully closed.
   */
  async closeShortcut(appId: number): Promise<boolean> {
    return await this.steamController.terminateGame(appId);
  }

  /**
   * Creates a new steam shortcut.
   * @param name The name of the shortcut to create.
   * @param exec The executable file for the shortcut.
   * @param startDir The start directory of the shortcut.
   * @param launchArgs The launch args of the shortcut.
   * @returns A promise resolving to true if the shortcut was successfully created.
   */
  async addShortcut(name: string, exec: string, startDir: string, launchArgs: string): Promise<number | null> {
    const appId = await this.steamController.addShortcut(name, exec, startDir, launchArgs);
    if (appId) {
      return appId;
    } else {
      PyInterop.log(`Failed to add shortcut. Name: ${name}`);
      PyInterop.toast("Error", "Failed to add shortcut");
      return null;
    }
  }

  /**
   * Deletes a shortcut from steam.
   * @param name Name of the shortcut to delete.
   * @returns A promise resolving to true if the shortcut was successfully deleted.
   */
  async removeShortcut(name: string): Promise<boolean> {
    const shortcuts = await this.steamController.getShortcut(name);
    const shortcut = shortcuts && shortcuts.length > 0 ? shortcuts[0] as SteamAppDetails : undefined;
    if (shortcut) {
      return await this.steamController.removeShortcut(shortcut.unAppID);
    } else {
      PyInterop.log(`Didn't find shortcut to remove. Name: ${name}`);
      PyInterop.toast("Error", "Didn't find shortcut to remove.");
      return false;
    }
  }

  /**
   * Deletes a shortcut from steam by id.
   * @param appId The id of the shortcut to delete.
   * @returns A promise resolving to true if the shortcut was successfully deleted.
   */
  async removeShortcutById(appId: number): Promise<boolean> {
    const res = await this.steamController.removeShortcut(appId);
    if (res) {
      return true;
    } else {
      PyInterop.log(`Failed to remove shortcut. AppId: ${appId}`);
      PyInterop.toast("Error", "Failed to remove shortcut");
      return false;
    }
  }

  /**
   * Registers for lifetime updates for a shortcut.
   * @param appId The id of the shortcut to register for.
   * @param onExit The function to run when the shortcut closes.
   * @returns An Unregisterer function to call to unregister from updates.
   */
  registerForShortcutExit(appId: number, onExit: (data: LifetimeNotification) => void): Unregisterer {
    return this.steamController.registerForAppLifetimeNotifications(appId, (data: LifetimeNotification) => {
      if (data.bRunning) return;

      onExit(data);
    });
  }
}