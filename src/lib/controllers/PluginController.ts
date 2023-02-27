import { ServerAPI } from "decky-frontend-lib";
import { ShortcutsController } from "./ShortcutsController";
import { InstancesController } from "./InstancesController";
import { PyInterop } from "../../PyInterop";
import { SteamController } from "./SteamController";
import { Shortcut } from "../data-structures/Shortcut";

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
  static setup(server: ServerAPI): void {
    this.server = server;
    this.steamController = new SteamController();
    this.shortcutsController = new ShortcutsController(this.steamController);
    this.instancesController = new InstancesController(this.shortcutsController);
  }

  /**
   * Sets the plugin to initialize once the user logs in.
   * @returns The unregister function for the login hook.
   */
  static initOnLogin(): Unregisterer {
    PyInterop.getHomeDir().then((res) => {
      PluginController.runnerPath = `\"/home/${res.result}/homebrew/plugins/bash-shortcuts/shortcutsRunner.sh\"`;
      PluginController.startDir = `\"/home/${res.result}/homebrew/plugins/bash-shortcuts/\"`;
    });

    return this.steamController.registerForAuthStateChange(async () => {
      if (await this.steamController.waitForServicesToInitialize()) {
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
  static async init(name: string): Promise<void> {
    this.shortcutName = name;

    //* clean out all shortcuts with names that start with "Bash Shortcuts - Instance"
    const oldInstances = (await this.shortcutsController.getShortcuts()).filter((shortcut:SteamAppDetails) => shortcut.strDisplayName.startsWith("Bash Shortcuts - Instance"));

    if (oldInstances.length > 0) {
      for (const instance of oldInstances) {
        await this.shortcutsController.removeShortcutById(instance.unAppID);
      }
    }
  }

  /**
   * Launches a steam shortcut.
   * @param shortcutName The name of the steam shortcut to launch.
   * @param shortcut The shortcut to launch.
   * @param runnerPath The runner path for the shortcut.
   * @returns A promise resolving to true if the shortcut was successfully launched.
   */
  static async launchShortcut(shortcut: Shortcut): Promise<boolean> {
    const createdInstance = await this.instancesController.createInstance(PluginController.shortcutName, shortcut, PluginController.runnerPath, PluginController.startDir);
    if (createdInstance) {
      PyInterop.log(`Created Instance for shortcut ${shortcut.name}`);
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
    const stoppedInstance = await this.instancesController.stopInstance(shortcut.id);
    if (stoppedInstance) {
      PyInterop.log(`Stopped Instance for shortcut ${shortcut.name}`);
      return await this.instancesController.killInstance(shortcut.id);
    } else {
      return false;
    }
  }

  /**
   * Checks if a shortcut is running.
   * @param shorcut The shortcut to check for.
   * @returns True if the shortcut is running.
   */
  static checkIfRunning(shorcut: Shortcut): boolean {
    return Object.keys(PluginController.instancesController.instances).includes(shorcut.id);
  }

  /**
   * Function to run when the plugin dismounts.
   */
  static onDismount(): void {
    this.shortcutsController.onDismount();
  }
}