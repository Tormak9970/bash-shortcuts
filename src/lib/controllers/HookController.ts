import { Navigation } from "decky-frontend-lib";
import { PyInterop } from "../../PyInterop";
import { WebSocketClient } from "../../WebsocketClient";
import { ShortcutsState } from "../../state/ShortcutsState";
import { Shortcut } from "../data-structures/Shortcut";
import { InstancesController } from "./InstancesController";
import { SteamController } from "./SteamController";

/**
 * Enum for the different hook events.
 */
export enum Hook {
  LOG_IN = "Log In",
  LOG_OUT = "Log Out",
  GAME_START = "Game Start",
  GAME_END = "Game End",
  GAME_INSTALL = "Game Install",
  GAME_UPDATE = "Game Update",
  GAME_UNINSTALL = "Game Uninstall",
  GAME_ACHIEVEMENT_UNLOCKED = "Game Achievement Unlocked",
  SCREENSHOT_TAKEN = "Screenshot Taken",
  DECK_SHUTDOWN = "Deck Shutdown",
  DECK_SLEEP = "Deck Sleep"
}

export const hookAsOptions = Object.values(Hook).map((entry) => { return { label: entry, data: entry } });

type HooksDict = { [key in Hook]: Set<string> }
type RegisteredDict = { [key in Hook]: Unregisterer }

/**
 * Controller for handling hook events.
 */
export class HookController {
  private state: ShortcutsState;
  private steamController: SteamController;
  private instancesController: InstancesController;
  private webSocketClient: WebSocketClient;

  // @ts-ignore
  shortcutHooks: HooksDict = {};
  // @ts-ignore
  registeredHooks: RegisteredDict = {};

  /**
   * Creates a new HooksController.
   * @param steamController The SteamController to use.
   * @param instancesController The InstanceController to use.
   * @param webSocketClient The WebSocketClient to use.
   * @param state The plugin state.
   */
  constructor(steamController: SteamController, instancesController: InstancesController, webSocketClient: WebSocketClient, state: ShortcutsState) {
    this.state = state;
    this.steamController = steamController;
    this.instancesController = instancesController;
    this.webSocketClient = webSocketClient;

    for (const hook of Object.values(Hook)) {
      this.shortcutHooks[hook] = new Set<string>();
    }
  }

  /**
   * Initializes the hooks for all shortcuts.
   * @param shortcuts The shortcuts to initialize the hooks of.
   */
  init(shortcuts: ShortcutsDictionary): void {
    this.liten();

    for (const shortcut of Object.values(shortcuts)) {
      this.updateHooks(shortcut);
    }
  }

  /**
   * Gets a shortcut by its id.
   * @param shortcutId The id of the shortcut to get.
   * @returns The shortcut.
   */
  private getShortcutById(shortcutId: string): Shortcut {
    return this.state.getPublicState().shortcuts[shortcutId];
  }

  /**
   * Sets wether a shortcut is running or not.
   * @param shortcutId The id of the shortcut to set.
   * @param value The new value.
   */
  private setIsRunning(shortcutId: string, value: boolean): void {
    this.state.setIsRunning(shortcutId, value);
  }

  /**
   * Checks if a shortcut is running.
   * @param shorcutId The id of the shortcut to check for.
   * @returns True if the shortcut is running.
   */
  private checkIfRunning(shorcutId: string): boolean {
    return Object.keys(this.instancesController.instances).includes(shorcutId);
  }

  /**
   * Updates the hooks for a shortcut.
   * @param shortcut The shortcut to update the hooks of.
   */
  updateHooks(shortcut: Shortcut) {
    const shortcutHooks = shortcut.hooks;

    for (const h of Object.keys(this.shortcutHooks)) {
      const hook = h as Hook;
      const registeredHooks = this.shortcutHooks[hook];

      if (shortcutHooks.includes(hook)) {
        this.registerHook(shortcut, hook);
      } else if (Object.keys(registeredHooks).includes(shortcut.id)) {
        this.unregisterHook(shortcut, hook);
      }
    }
  }

  /**
   * Registers a hook for a shortcut.
   * @param shortcut The shortcut to register the hook for.
   * @param hook The hook to register.
   */
  private registerHook(shortcut: Shortcut, hook: Hook): void {
    this.shortcutHooks[hook].add(shortcut.id);
    PyInterop.log(`Registered hook: ${hook} for shortcut: ${shortcut.name} Id: ${shortcut.id}`);
  }

  /**
   * Unregisters all hooks for a given shortcut.
   * @param shortcut The shortcut to unregister the hooks from.
   */
  unregisterAllHooks(shortcut: Shortcut) {
    const shortcutHooks = shortcut.hooks;

    for (const hook of shortcutHooks) {
      this.unregisterHook(shortcut, hook);
    }
  }

  /**
   * Unregisters a registered hook for a shortcut.
   * @param shortcut The shortcut to remove the hook from.
   * @param hook The hook to remove.
   */
  private unregisterHook(shortcut: Shortcut, hook: Hook): void {
    this.shortcutHooks[hook].delete(shortcut.id);
    PyInterop.log(`Unregistered hook: ${hook} for shortcut: ${shortcut.name} Id: ${shortcut.id}`);
  }

  private async runShortcuts(hook: Hook, flags: { [flag: string]: string }): Promise<void> {
    flags["h"] = hook;

    for (const shortcutId of this.shortcutHooks[hook].values()) {
      if (!this.checkIfRunning(shortcutId)) {
        const shortcut = this.getShortcutById(shortcutId);
        const createdInstance = await this.instancesController.createInstance(shortcut);

        if (createdInstance) {
          PyInterop.log(`Created Instance for shortcut { Id: ${shortcut.id}, Name: ${shortcut.name} } on hook: ${hook}`);
          const didLaunch = await this.instancesController.launchInstance(shortcut.id, async () => {
            if (this.checkIfRunning(shortcut.id) && shortcut.isApp) {
              this.setIsRunning(shortcut.id, false);
              const killRes = await this.instancesController.killInstance(shortcut.id);
              if (killRes) {
                Navigation.Navigate("/library/home");
                Navigation.CloseSideMenus();
              } else {
                PyInterop.toast("Error", "Failed to kill shortcut.");
              }
            }
          }, flags);

          if (!didLaunch) {
            PyInterop.log(`Failed to launch instance for shortcut { Id: ${shortcut.id}, Name: ${shortcut.name} } on hook: ${hook}`);
          } else {
            if (!shortcut.isApp) {
              PyInterop.log(`Registering for WebSocket messages of type: ${shortcut.id} on hook: ${hook}...`);

              this.webSocketClient.on(shortcut.id, (data: any) => {
                if (data.type == "end") {
                  if (data.status == 0) {
                    PyInterop.toast(shortcut.name, "Shortcut execution finished.");
                  } else {
                    PyInterop.toast(shortcut.name, "Shortcut execution was canceled.");
                  }

                  this.setIsRunning(shortcut.id, false);
                }
              });
            }

            this.setIsRunning(shortcut.id, true);
          }
        } else {
          PyInterop.toast("Error", "Shortcut failed. Check the command.");
          PyInterop.log(`Failed to create instance for shortcut { Id: ${shortcut.id}, Name: ${shortcut.name} } on hook: ${hook}`);
        }
      } else {
        PyInterop.log(`Skipping hook: ${hook} for shortcut: ${shortcutId} because it was already running.`);
      }
    }
  }

  /**
   * Sets up all of the hooks for the plugin.
   */
  liten(): void {
    this.registeredHooks[Hook.LOG_IN] = this.steamController.registerForAuthStateChange(async (username: string) => {
      this.runShortcuts(Hook.LOG_IN, { "u": username });
    }, null, false);

    this.registeredHooks[Hook.LOG_OUT] = this.steamController.registerForAuthStateChange(null, async (username: string) => {
      this.runShortcuts(Hook.LOG_IN, { "u": username });
    }, false);

    this.registeredHooks[Hook.GAME_START] = this.steamController.registerForAllAppLifetimeNotifications((appId: number, data: LifetimeNotification) => {
      if (data.bRunning && (collectionStore.allAppsCollection.apps.has(appId) || collectionStore.deckDesktopApps.apps.has(appId))) {
        const app = collectionStore.allAppsCollection.apps.get(appId) ?? collectionStore.deckDesktopApps.apps.get(appId);
        if (app) {
          this.runShortcuts(Hook.GAME_START, { "i": appId.toString(), "n": app.display_name });
        }
      }
    });

    this.registeredHooks[Hook.GAME_END] = this.steamController.registerForAllAppLifetimeNotifications((appId: number, data: LifetimeNotification) => {
      if (!data.bRunning && (collectionStore.allAppsCollection.apps.has(appId) || collectionStore.deckDesktopApps.apps.has(appId))) {
        const app = collectionStore.allAppsCollection.apps.get(appId) ?? collectionStore.deckDesktopApps.apps.get(appId);
        if (app) {
          this.runShortcuts(Hook.GAME_END, { "i": appId.toString(), "n": app.display_name });
        }
      }
    });

    this.registeredHooks[Hook.GAME_INSTALL] = this.steamController.registerForGameInstall((appData: SteamAppOverview) => {
      this.runShortcuts(Hook.GAME_INSTALL, { "i": appData.appid.toString(), "n": appData.display_name });
    });

    this.registeredHooks[Hook.GAME_UPDATE] = this.steamController.registerForGameUpdate((appData: SteamAppOverview) => {
      this.runShortcuts(Hook.GAME_UPDATE, { "i": appData.appid.toString(), "n": appData.display_name });
    });

    this.registeredHooks[Hook.GAME_UNINSTALL] = this.steamController.registerForGameUninstall((appData: SteamAppOverview) => {
      this.runShortcuts(Hook.GAME_UNINSTALL, { "i": appData.appid.toString(), "n": appData.display_name });
    });

    this.registeredHooks[Hook.GAME_ACHIEVEMENT_UNLOCKED] = this.steamController.registerForGameAchievementNotification((data: AchievementNotification) => {
      const appId = data.unAppID;
      const app = collectionStore.localGamesCollection.apps.get(appId);
      if (app) {
        this.runShortcuts(Hook.GAME_ACHIEVEMENT_UNLOCKED, { "i": appId.toString(), "n": app.display_name, "a": data.achievement.strName });
      }
    });

    this.registeredHooks[Hook.SCREENSHOT_TAKEN] = this.steamController.registerForScreenshotNotification((data: ScreenshotNotification) => {
      const appId = data.unAppID;
      const app = collectionStore.localGamesCollection.apps.get(appId);
      if (app) {
        this.runShortcuts(Hook.GAME_ACHIEVEMENT_UNLOCKED, { "i": appId.toString(), "n": app.display_name, "p": data.details.strUrl });
      }
    });

    this.registeredHooks[Hook.DECK_SLEEP] = this.steamController.registerForSleepStart(() => {
      this.runShortcuts(Hook.DECK_SLEEP, {});
    });

    this.registeredHooks[Hook.DECK_SHUTDOWN] = this.steamController.registerForShutdownStart(() => {
      this.runShortcuts(Hook.DECK_SHUTDOWN, {});
    });
  }

  /**
   * Dismounts the HooksController.
   */
  dismount(): void {
    for (const h of Object.keys(this.registeredHooks)) {
      const hook = h as Hook;
      const registeredHook = this.registeredHooks[hook];
      if (registeredHook) {
        this.registeredHooks[hook].unregister();
        PyInterop.log(`Unregistered hook: ${hook}`);
      }
    }
  }
}