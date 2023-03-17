import { RoutePatch, ServerAPI, useParams } from "decky-frontend-lib";
import { ShortcutsController } from "./ShortcutsController";
import { InstancesController } from "./InstancesController";
import { PyInterop } from "../../PyInterop";
import { SteamController } from "./SteamController";
import { Shortcut } from "../data-structures/Shortcut";
import { WebSocketClient } from "../../WebsocketClient";
import { HookController } from "./HookController";
import { ShortcutsState } from "../../state/ShortcutsState";

/**
 * Main controller class for the plugin.
 */
export class PluginController {
  private static server: ServerAPI;
  private static state: ShortcutsState;

  private static steamController: SteamController;
  private static shortcutsController: ShortcutsController;
  private static instancesController: InstancesController;
  private static hooksController: HookController;
  private static webSocketClient: WebSocketClient;

  private static gameLifetimeRegister: Unregisterer;
  private static libraryTabPatch: RoutePatch;

  /**
   * Sets the plugin's serverAPI.
   * @param server The serverAPI to use.
   * @param state The plugin state.
   */
  static setup(server: ServerAPI, state: ShortcutsState): void {
    this.server = server;
    this.state = state;
    this.steamController = new SteamController();
    this.shortcutsController = new ShortcutsController(this.steamController);
    this.webSocketClient = new WebSocketClient("localhost", "5000", 1000);
    this.instancesController = new InstancesController(this.shortcutsController, this.webSocketClient, this.state);
    this.hooksController = new HookController(this.steamController, this.instancesController, this.webSocketClient, this.state);

    this.gameLifetimeRegister = this.steamController.registerForAllAppLifetimeNotifications((appId: number, data: LifetimeNotification) => {
      const currGame = this.state.getPublicState().currentGame;
      
      if (data.bRunning) {
        if (currGame == null || currGame.appid != appId) {
          const overview = appStore.GetAppOverviewByAppID(appId);
          this.state.setCurrentGame(overview);

          PyInterop.log(`Set currentGame to ${overview?.display_name} appId: ${appId}`);
          console.log("Overview:", overview);
        }
      } else {
        const pathStart = "/routes/library/app/";
        const routePath = window.location.pathname;

        if (routePath.startsWith(pathStart)) {
          // TODO: get current appId from route
          const appId = parseInt(routePath.substring(routePath.indexOf(pathStart) + 1));

          if (currGame == null || currGame.appid != appId) {
            // TODO: fetch overview from appStore
            const overview = appStore.GetAppOverviewByAppID(appId);
            // TODO: set plugin state
            this.state.setCurrentGame(overview);

            PyInterop.log(`Set currentGame to ${overview?.display_name} appId: ${appId}`);
            console.log("Overview:", overview);
          }
        } else {
          this.state.setCurrentGame(null);
        }
      }
    });
    this.libraryTabPatch = this.server.routerHook.addPatch('/library/app/:appid', (props?: { path?: string }) => {
      if (props?.path) {
        const currGame = this.state.getPublicState().currentGame;
        // TODO: get appId from path
        const { appid } = useParams<{ appid: string }>();
        const appId = parseInt(appid);

        if (currGame == null || currGame.appid != appId) {
          // TODO: fetch overview from appStore
          const overview = appStore.GetAppOverviewByAppID(appId);
          // TODO: set plugin state
          this.state.setCurrentGame(overview);

          PyInterop.log(`Set currentGame to ${overview?.display_name} appId: ${appId}`);
          console.log("Overview:", overview);
        }
      }
      
      return props;
    }
  )
  }

  /**
   * Sets the plugin to initialize once the user logs in.
   * @returns The unregister function for the login hook.
   */
  static initOnLogin(): Unregisterer {
    return this.steamController.registerForAuthStateChange(async (username) => {
      PyInterop.log(`user logged in. [DEBUG INFO] username: ${username};`);
      if (await this.steamController.waitForServicesToInitialize()) {
        PluginController.init();
      } else {
        PyInterop.toast("Error", "Failed to initialize, try restarting.");
      }
    }, null, true);
  }

  /**
   * Initializes the Plugin.
   */
  static async init(): Promise<void> {
    PyInterop.log("PluginController initializing...");

    //* clean out all shortcuts with names that start with "Bash Shortcuts - Instance"
    const oldInstances = (await this.shortcutsController.getShortcuts()).filter((shortcut:SteamAppDetails) => shortcut.strDisplayName.startsWith("Bash Shortcuts - Instance"));

    if (oldInstances.length > 0) {
      for (const instance of oldInstances) {
        await this.shortcutsController.removeShortcutById(instance.unAppID);
      }
    }

    this.webSocketClient.connect();

    const shortcuts = (await PyInterop.getShortcuts()).result;
    if (typeof shortcuts === "string") {
      PyInterop.log(`Failed to get shortcuts for hooks. Error: ${shortcuts}`);
    } else {
      this.hooksController.init(shortcuts);
    }
    
    PyInterop.log("PluginController initialized.");
  }

  /**
   * Checks if a shortcut is running.
   * @param shorcutId The id of the shortcut to check for.
   * @returns True if the shortcut is running.
   */
  static checkIfRunning(shorcutId: string): boolean {
    return Object.keys(PluginController.instancesController.instances).includes(shorcutId);
  }

  /**
   * Launches a steam shortcut.
   * @param shortcutName The name of the steam shortcut to launch.
   * @param shortcut The shortcut to launch.
   * @param runnerPath The runner path for the shortcut.
   * @param onExit An optional function to run when the instance closes.
   * @returns A promise resolving to true if the shortcut was successfully launched.
   */
  static async launchShortcut(shortcut: Shortcut, onExit: (data?: LifetimeNotification) => void = () => {}): Promise<boolean> {
    const createdInstance = await this.instancesController.createInstance(shortcut);
    if (createdInstance) {
      PyInterop.log(`Created Instance for shortcut ${shortcut.name}`);
      return await this.instancesController.launchInstance(shortcut.id, onExit);
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
      PyInterop.log(`Failed to stop instance for shortcut ${shortcut.name}. Id: ${shortcut.id}`);
      return false;
    }
  }

  /**
   * Kills a shortcut's instance.
   * @param shortcut The shortcut to kill.
   * @returns A promise resolving to true if the shortcut's instance was successfully killed.
   */
  static async killShortcut(shortcut: Shortcut): Promise<boolean> {
    return await this.instancesController.killInstance(shortcut.id);
  }

  /**
   * Updates the hooks for a specific shortcut.
   * @param shortcut The shortcut to update the hooks for.
   */
  static updateHooks(shortcut: Shortcut): void {
    this.hooksController.updateHooks(shortcut);
  }

  /**
   * Removes the hooks for a specific shortcut.
   * @param shortcut The shortcut to remove the hooks for.
   */
  static removeHooks(shortcut: Shortcut): void {
    this.hooksController.unregisterAllHooks(shortcut);
  }

  /**
   * Registers a callback to run when WebSocket messages of a given type are recieved.
   * @param type The type of message to register for.
   * @param callback The callback to run.
   */
  static onWebSocketEvent(type: string, callback: (data: any) => void) {
    this.webSocketClient.on(type, callback);
  }

  /**
   * Function to run when the plugin dismounts.
   */
  static dismount(): void {
    PyInterop.log("PluginController dismounting...");

    this.shortcutsController.onDismount();
    this.webSocketClient.disconnect();
    this.hooksController.dismount();
    this.gameLifetimeRegister.unregister();
    this.server.routerHook.removePatch('/library/app/:appid', this.libraryTabPatch);
    
    PyInterop.log("PluginController dismounted.");
  }
}