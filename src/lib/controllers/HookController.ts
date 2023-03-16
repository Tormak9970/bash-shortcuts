import { PyInterop } from "../../PyInterop";
import { Shortcut } from "../data-structures/Shortcut";
import { InstancesController } from "./InstancesController";
// import { PluginController } from "./PluginController";
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
  private steamController: SteamController;
  private instancesController: InstancesController;

  // @ts-ignore
  shortcutHooks: HooksDict = {};
  // @ts-ignore
  registeredHooks: RegisteredDict = {};

  /**
   * Creates a new HooksController.
   * @param steamController The SteamController to use.
   * @param instancesController The InstanceController to use.
   */
  constructor(steamController: SteamController, instancesController: InstancesController) {
    for (const hook of Object.values(Hook)) {
      this.shortcutHooks[hook] = new Set<string>();
    }

    this.steamController = steamController;
    this.instancesController = instancesController;
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
   * Gets the current date and time.
   * @returns A tuple containing [date, time] in US standard format.
   */
  private getDatetime(): [string, string] {
    const date = new Date();

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    return [
      `${month}-${day}-${year}`,
      `${hours}:${minutes}:${seconds}`
    ];
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

  private async runShortcuts(hook: Hook, flags: { [flag: string ]: string }): Promise<void> {
    flags["h"] = hook;

    for (const shortcutId of this.shortcutHooks[hook].values()) {
      // if (!PluginController.checkIfRunning(shortcutId)) {
      //   const shortcut = PluginController.getShortcutById(shortcutId);
      //   const createdInstance = await this.instancesController.createInstance(PluginController.shortcutName, shortcut, PluginController.runnerPath, PluginController.startDir);

      //   if (createdInstance) {
      //     PyInterop.log(`Created Instance for shortcut ${shortcut.name}`);
      //     // return await this.instancesController.launchInstance(shortcut.id, onExit);
      //   } else {
      //     // return false;
      //   }
      // } else {
      //   PyInterop.log(`Skipping hook: ${hook} for shortcut: ${shortcutId} because it was already running.`);
      // }
    }
  }

  /**
   * Sets up all of the hooks for the plugin.
   */
  liten(): void {
    this.registeredHooks[Hook.LOG_IN] = this.steamController.registerForAuthStateChange(async (username: string) => {
      const [ date, time ] = this.getDatetime();

      const flags = { "t": time, "d": date };
      flags["u"] = username;

      this.runShortcuts(Hook.LOG_IN, flags);
    }, null, false);

    this.registeredHooks[Hook.LOG_OUT] = this.steamController.registerForAuthStateChange(null, async (username: string) => {
      const [ date, time ] = this.getDatetime();

      const flags = { "t": time, "d": date };
      flags["u"] = username;
      
      this.runShortcuts(Hook.LOG_IN, flags);
    }, false);

    this.registeredHooks[Hook.GAME_START] = this.steamController.registerForAllAppLifetimeNotifications((appId: number, data: LifetimeNotification) => {
      if (data.bRunning && (collectionStore.allAppsCollection.apps.has(appId) || collectionStore.deckDesktopApps.apps.has(appId))) {
        const app = collectionStore.allAppsCollection.apps.get(appId) ?? collectionStore.deckDesktopApps.apps.get(appId);
        if (app) {
          const [ date, time ] = this.getDatetime();
          
          const flags = { "t": time, "d": date };
          flags["i"] = appId;
          flags["n"] = app.display_name;
          
          this.runShortcuts(Hook.GAME_START, flags);
        }
      }
    });

    this.registeredHooks[Hook.GAME_END] = this.steamController.registerForAllAppLifetimeNotifications((appId: number, data: LifetimeNotification) => {
      if (!data.bRunning && (collectionStore.allAppsCollection.apps.has(appId) || collectionStore.deckDesktopApps.apps.has(appId))) {
        const app = collectionStore.allAppsCollection.apps.get(appId) ?? collectionStore.deckDesktopApps.apps.get(appId);
        if (app) {
          const [ date, time ] = this.getDatetime();
          
          const flags = { "t": time, "d": date };
          flags["i"] = appId;
          flags["n"] = app.display_name;
          
          this.runShortcuts(Hook.GAME_END, flags);
        }
      }
    });

    this.registeredHooks[Hook.GAME_INSTALL] = this.steamController.registerForGameInstall((appData: SteamAppOverview) => {
      const [ date, time ] = this.getDatetime();
          
      const flags = { "t": time, "d": date };
      flags["i"] = appData.appid;
      flags["n"] = appData.display_name;
      
      this.runShortcuts(Hook.GAME_INSTALL, flags);
    });

    this.registeredHooks[Hook.GAME_UPDATE] = this.steamController.registerForGameUpdate((appData: SteamAppOverview) => {
      const [ date, time ] = this.getDatetime();
          
      const flags = { "t": time, "d": date };
      flags["i"] = appData.appid;
      flags["n"] = appData.display_name;
      
      this.runShortcuts(Hook.GAME_UPDATE, flags);
    });

    this.registeredHooks[Hook.GAME_UNINSTALL] = this.steamController.registerForGameUninstall((appData: SteamAppOverview) => {
      const [ date, time ] = this.getDatetime();
          
      const flags = { "t": time, "d": date };
      flags["i"] = appData.appid;
      flags["n"] = appData.display_name;
      
      this.runShortcuts(Hook.GAME_UNINSTALL, flags);
    });
    
    this.registeredHooks[Hook.GAME_ACHIEVEMENT_UNLOCKED] = this.steamController.registerForGameAchievementNotification((data: AchievementNotification) => {
      const appId = data.unAppID;
      const app = collectionStore.localGamesCollection.apps.get(appId);
      if (app) {
        const [ date, time ] = this.getDatetime();
        
        const flags = { "t": time, "d": date };
        flags["i"] = appId;
        flags["n"] = app.display_name;
        flags["a"] = data.achievement.strName;
        
        this.runShortcuts(Hook.GAME_ACHIEVEMENT_UNLOCKED, flags);
      }
    });

    this.registeredHooks[Hook.SCREENSHOT_TAKEN] = this.steamController.registerForScreenshotNotification((data: ScreenshotNotification) => {
      const appId = data.unAppID;
      const app = collectionStore.localGamesCollection.apps.get(appId);
      if (app) {
        const [ date, time ] = this.getDatetime();
        
        const flags = { "t": time, "d": date };
        flags["i"] = appId;
        flags["n"] = app.display_name;
        flags["a"] = data.details.strUrl;
        
        this.runShortcuts(Hook.GAME_ACHIEVEMENT_UNLOCKED, flags);
      }
    });

    this.registeredHooks[Hook.DECK_SLEEP] = this.steamController.registerForSleepStart(() => {
      const [ date, time ] = this.getDatetime();

      const flags = { "t": time, "d": date };
      
      this.runShortcuts(Hook.DECK_SLEEP, flags);
    });

    this.registeredHooks[Hook.DECK_SHUTDOWN] = this.steamController.registerForShutdownStart(() => {
      const [ date, time ] = this.getDatetime();

      const flags = { "t": time, "d": date };
      
      this.runShortcuts(Hook.DECK_SHUTDOWN, flags);
    });
  }

  /**
   * Dismounts the HooksController.
   */
  dismount(): void {
    for (const hook of Object.keys(this.registeredHooks)) {
      this.registeredHooks[hook].unregister();
      PyInterop.log(`Unregistered hook: ${hook}`);
    }
  }
}