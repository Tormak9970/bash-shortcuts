import { ServerAPI } from "decky-frontend-lib";
import { ShortcutsController } from "./ShortcutsController";
import { InstancesController } from "./InstancesController";
import { PyInterop } from "../../PyInterop";
import { SteamController } from "./SteamController";
import { waitForServicesInitialized } from "../Services";
import { Shortcut } from "../data-structures/Shortcut";

declare global {
  var SteamClient: SteamClient;
  var collectionStore: CollectionStore;
}

/**
 * Main controller class for the plugin.
 */
export class PluginController {
  static mainAppId: number;

  // @ts-ignore
  private static server: ServerAPI;
  private static steamController: SteamController;
  private static shortcutsController: ShortcutsController;
  private static instancesController: InstancesController;

  private static shortcutName: string;
  private static runnerPath = "\"/home/deck/homebrew/plugins/bash-shortcuts/shortcutsRunner.sh\"";
  private static startDir = "\"/home/deck/homebrew/plugins/bash-shortcuts/\"";

  /**
   * Sets the plugin's serverAPI.
   * @param server The serverAPI to use.
   */
  static setup(server: ServerAPI) {
    this.server = server;
    this.steamController = new SteamController();
    this.shortcutsController = new ShortcutsController(this.steamController);
    this.instancesController = new InstancesController(this.shortcutsController);
  }

  /**
   * Sets the plugin to initialize once the user logs in.
   * @returns The unregister function for the login hook.
   */
  static initOnLogin() {
    PyInterop.getHomeDir().then((res) => {
      PluginController.runnerPath = `\"/home/${res.result}/homebrew/plugins/bash-shortcuts/shortcutsRunner.sh\"`;
      PluginController.startDir = `\"/home/${res.result}/homebrew/plugins/bash-shortcuts/\"`;
    });

    return this.steamController.registerForAuthStateChange(async () => {
      if (await waitForServicesInitialized()) {
        PluginController.init("Bash Shortcuts");
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
  }

  /**
   * Launches a steam shortcut.
   * @param shortcutName The name of the steam shortcut to launch.
   * @param shortcut The shortcut to launch.
   * @param runnerPath The runner path for the shortcut.
   * @returns A promise resolving to true if the shortcut was successfully launched.
   */
  static async launchShortcut(shortcut: Shortcut): Promise<boolean> {
    const createdInstance = await this.instancesController.startInstance(PluginController.shortcutName, shortcut, PluginController.runnerPath, PluginController.startDir);
    if (createdInstance) {
      return await this.instancesController.launchInstance(shortcut.id);
    } else {
      return false;
    }
  }

  /**
   * Closes a running shortcut.
   * @param shortcut The shortcut to close.
   * @returns A promise resolving to true if the shortcut was successfully closed.
   */
  static async closeShortcut(shortcut:Shortcut): Promise<boolean> {
    return await this.instancesController.killInstance(shortcut.id);
  }

  static checkIfRunning(shorcut: Shortcut) {
    return Object.keys(PluginController.instancesController.instances).includes(shorcut.id);
  }

  /**
   * Function to run when the plugin dismounts.
   */
  static onDismount() {
    this.shortcutsController.onDismount();
  }
}