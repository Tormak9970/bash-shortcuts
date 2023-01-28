import { sleep } from "decky-frontend-lib";
import { AppOverview, AppDetails, LifetimeNotification, SteamClient, SteamShortcut } from "./SteamClient";
import { PyInterop } from "../PyInterop";

//? Credit to FrogTheFrog for some of the methods: https://github.com/FrogTheFrog/SDH-MoonDeck/blob/main/src/lib/steamutils.ts

declare global {
  var SteamClient: SteamClient;
}

export class SteamUtils {
  private static hasLoggedIn = false;
  private static hasLoggedOut = false;

  static async getShortcuts(): Promise<SteamShortcut[]> {
    const res = await SteamClient.Apps.GetAllShortcuts();
    
    console.log(`Got shortcuts. [DEBUG INFO] resultsLength: ${res.length};`);
    PyInterop.log(`Got shortcuts. [DEBUG INFO] resultsLength: ${res.length};`);

    return res as SteamShortcut[];
  }

  static async getShortcut(appName: string): Promise<SteamShortcut[] | undefined> {
    const res = await SteamClient.Apps.GetAllShortcuts();
    const shortcutsList = res as SteamShortcut[];

    console.log(`Got shortcuts with desired name. [DEBUG INFO] appName: ${appName}; resultsLength: ${shortcutsList.length};`);
    PyInterop.log(`Got shortcuts with desired name. [DEBUG INFO] appName: ${appName}; resultsLength: ${shortcutsList.length};`);
    return shortcutsList.filter((s: SteamShortcut) => s.data.strAppName == appName);
  }

  static async getAppOverview(appId: number) {
    const { appStore } = (window as any);
    return appStore.GetAppOverviewByAppID(appId) as AppOverview | null;
  }

  static async waitForAppOverview(appId: number, predicate: (overview: AppOverview | null) => boolean) {
    let retries = 4;
    while (retries--) {
      if (predicate(await this.getAppOverview(appId))) {
        return true;
      }
      if (retries > 0) {
        await sleep(250);
      }
    }

    return false;
  }

  static async getAppDetails(appId: number): Promise<AppDetails | null> {
    return new Promise((resolve) => {
      const { unregister } = SteamClient.Apps.RegisterForAppDetails(appId, (details: any) => {
        unregister();
        resolve(details.unAppID === undefined ? null : details);
      });
    });
  }

  static async waitForAppDetails(appId: number, predicate: (details: AppDetails | null) => boolean) {
    let retries = 4;
    while (retries--) {
      if (predicate(await this.getAppDetails(appId))) {
        console.log(`Got game details (${ 4 - retries} tries). [DEBUG INFO] appId: ${appId};`);
        PyInterop.log(`Got game details (${ 4 - retries} tries). [DEBUG INFO] appId: ${appId};`);
        return true;
      }
      if (retries > 0) {
        await sleep(250);
      }
    }


    console.error(`Could not get game details (ran out of retries). [DEBUG INFO] appId: ${appId};`);
    PyInterop.log(`Could not get game details (ran out of retries). [DEBUG INFO] appId: ${appId};`);
    return false;
  }

  static async hideApp(appId: number) {
    if (!await this.waitForAppOverview(appId, (overview) => overview !== null)) {
      console.error(`Could not hide app (outright failed). [DEBUG INFO] appId: ${appId};`);
      PyInterop.log(`Could not hide app (outright failed). [DEBUG INFO] appId: ${appId};`);
      return false;
    }

    const { collectionStore } = (window as any);
    if (collectionStore.BIsHidden(appId)) {
      console.log(`Successfully hid app (1 try). [DEBUG INFO] appId: ${appId};`);
      PyInterop.log(`Successfully hid app (1 try). [DEBUG INFO] appId: ${appId};`);
      return true;
    }

    collectionStore.SetAppsAsHidden([appId], true);

    let retries = 4;
    while (retries--) {
      if (collectionStore.BIsHidden(appId)) {
        console.log(`Successfully hid app (${ 4 - retries + 1} tries). [DEBUG INFO] appId: ${appId};`);
        PyInterop.log(`Successfully hid app (${ 4 - retries + 1} tries). [DEBUG INFO] appId: ${appId};`);
        return true;
      }
      if (retries > 0) {
        await sleep(250);
      }
    }

    console.error(`Could not hide app (ran out of retries). [DEBUG INFO] appId: ${appId};`);
    PyInterop.log(`Could not hide app (ran out of retries). [DEBUG INFO] appId: ${appId};`);
    return false;
  }

  static async addShortcut(appName: string, execPath: string, hideShortcut: boolean) {
    const appId = await SteamClient.Apps.AddShortcut(appName, execPath) as number | undefined | null;
    if (typeof appId === "number") {
      if (await this.waitForAppOverview(appId, (overview) => overview !== null)) {
        const overview = await this.getAppOverview(appId);
        if (overview && overview.display_name == appName) {
          if (hideShortcut) {
            PyInterop.log(`Attempting to hide shortcut. [DEBUG INFO] appId: ${appId}; appName: ${appName};`);
            PyInterop.log(`Attempting to hide shortcut. [DEBUG INFO] appId: ${appId}; appName: ${appName};`);
            await this.hideApp(appId);
          }
          return appId;
        }
      }

      // necessary cleanup to avoid duplicates, which is very BAD (Steam goes bonkers)
      await SteamUtils.removeShortcut(appId as number);
      PyInterop.log(`Removing shortcut. [DEBUG INFO] appId: ${appId}; appName: ${appName};`);
    }

    console.error(`Could not add shortcut. [DEBUG INFO] appId: ${appId}; appName: ${appName};`);
    PyInterop.log(`Could not add shortcut. [DEBUG INFO] appId: ${appId}; appName: ${appName};`);

    return null;
  }

  static async setShortcutExe(appId: number, exePath: string) {
    const details = await this.waitForAppDetails(appId, (details) => details !== null) ? await this.getAppDetails(appId) : null;
    if (!details) {
      console.error(`Could not set exe path (does not exist)! [DEBUG INFO] appId: ${appId};`);
      PyInterop.log(`Could not set exe path (does not exist)! [DEBUG INFO] appId: ${appId};`);
      return false;
    }

    if (details.strShortcutExe == `\"${exePath}\"` || details.strShortcutExe == exePath) {
      PyInterop.log(`Set shortcut exe path. [DEBUG INFO] strDisplayName: ${details.strDisplayName}; appId:${appId};`);
      return true;
    }

    SteamClient.Apps.SetShortcutExe(appId, exePath);
    if (!await this.waitForAppDetails(appId, (details) => details !== null && (details.strShortcutExe == `\"${exePath}\"` || details.strShortcutExe == exePath))) {
      console.error(`Could not exe path. [DEBUG INFO] strDisplayName: ${details.strDisplayName}; appId: ${appId};`);
      PyInterop.log(`Could not exe path. [DEBUG INFO] strDisplayName: ${details.strDisplayName}; appId: ${appId};`);
      return false;
    }
    return true;
  }

  static async setShortcutStartDir(appId: number, startDir: string) {
    const details = await this.waitForAppDetails(appId, (details) => details !== null) ? await this.getAppDetails(appId) : null;
    if (!details) {
      console.error(`Could not start dir (does not exist). [DEBUG INFO] appId: ${appId};`);
      PyInterop.log(`Could not start dir (does not exist). [DEBUG INFO] appId: ${appId};`);
      return false;
    }

    if (details.strShortcutStartDir == `\"${startDir}\"` || details.strShortcutStartDir == startDir) {
      PyInterop.log(`Set start dir. [DEBUG INFO] appId: ${appId};`);
      return true;
    }

    SteamClient.Apps.SetShortcutStartDir(appId, startDir);
    if (!await this.waitForAppDetails(appId, (details) => details !== null && (details.strShortcutStartDir == `\"${startDir}\"` || details.strShortcutStartDir == startDir))) {
      console.error(`Could not start dir. [DEBUG INFO] appId: ${appId};`);
      PyInterop.log(`Could not start dir. [DEBUG INFO] appId: ${appId};`);
      return false;
    }
    return true;
  }

  static async removeShortcut(appId: number) {
    const overview = await this.waitForAppOverview(appId, (overview) => overview !== null) ? await this.getAppOverview(appId) : null;
    if (!overview) {
      console.error(`Could not remove shortcut (does not exist). [DEBUG INFO] appId: ${appId};`);
      PyInterop.log(`Could not remove shortcut (does not exist). [DEBUG INFO] appId: ${appId};`);
      return true;
    }

    const { collectionStore } = (window as any);
    const collections = collectionStore.userCollections;

    SteamClient.Apps.RemoveShortcut(appId);
    for (const collection of collections) {
      if (collection.bAllowsDragAndDrop && collection.apps.has(appId)) {
        console.log(`Removed shortcut from collection. [DEBUG INFO] appId: ${appId}; collection: ${collection};`);
        PyInterop.log(`Removed shortcut from collection. [DEBUG INFO] appId: ${appId}; collection: ${collection};`);
        collection.AsDragDropCollection().RemoveApps([overview]);
      }
    }

    if (!await this.waitForAppOverview(appId, (overview) => overview === null)) {
      console.error(`Could not remove shortcut. [DEBUG INFO] appId: ${appId};`);
      PyInterop.log(`Could not remove shortcut. [DEBUG INFO] appId: ${appId};`);
      return false;
    }

    return true;
  }

  static async setAppLaunchOptions(appId: number, options: string) {
    const details = await this.waitForAppDetails(appId, (details) => details !== null) ? await this.getAppDetails(appId) : null;
    if (!details) {
      console.error(`Could not add launch options (does not exist). [DEBUG INFO] appId: ${appId};`);
      PyInterop.log(`Could not add launch options (does not exist). [DEBUG INFO] appId: ${appId};`);
      return false;
    }

    if (details.strLaunchOptions === options) {
      PyInterop.log(`Removed shortcut. [DEBUG INFO] appId: ${appId};`);
      return true;
    }

    SteamClient.Apps.SetAppLaunchOptions(appId, options);
    if (!await this.waitForAppDetails(appId, (details) => details !== null && details.strLaunchOptions === options)) {
      console.error(`Could not add launch options. [DEBUG INFO] appId: ${appId};`);
      PyInterop.log(`Could not add launch options. [DEBUG INFO] appId: ${appId};`);
      return false;
    }
    return true;
  }

  static async getGameId(appId: number) {
    const overview = await this.waitForAppOverview(appId, (overview) => overview !== null) ? await this.getAppOverview(appId) : null;
    if (!overview) {
      console.error(`Could not get game id. [DEBUG INFO] appId: ${appId};`);
      PyInterop.log(`Could not get game id. [DEBUG INFO] appId: ${appId};`);
      return null;
    }

    return overview.gameid;
  }

  static registerForGameLifetime(callback: (data: LifetimeNotification) => void) {
    const { unregister } = SteamClient.GameSessions.RegisterForAppLifetimeNotifications(callback);
    return unregister as () => void;
  }

  static async waitForGameLifetime(appId: number | null, options: { initialTimeout?: number, waitForStart?: boolean, waitUntilNewEnd?: boolean } = {}) {
    return new Promise<boolean>((resolve) => {
      let timeoutId: any = null;
      let startAwaited: boolean = false;
      const unregister = this.registerForGameLifetime((data: LifetimeNotification) => {
        if (appId !== null && data.unAppID !== appId) {
          return;
        }

        if (!startAwaited) {
          startAwaited = data.bRunning;
        }

        if (options.waitForStart && !startAwaited) {
          return;
        }

        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (options.waitUntilNewEnd) {
          if (!startAwaited || data.bRunning) {
            return;
          }
        }

        unregister();
        PyInterop.log(`Game lifetime subscription ended, game closed. [DEBUG INFO] appId: ${appId};`);
        resolve(true);
      });

      if (options.initialTimeout) {
        timeoutId = setTimeout(() => {
          PyInterop.log(`Game lifetime subscription expired. [DEBUG INFO] appId: ${appId};`);
          unregister();
          resolve(false);
        }, options.initialTimeout);
      }
    });
  }

  static async runGame(appId: number, waitUntilGameStops: boolean) {
    // Currently Steam fails to properly set appid for non-Steam games :/
    const gameStart = this.waitForGameLifetime(null, { initialTimeout: 1500, waitForStart: true, waitUntilNewEnd: waitUntilGameStops });
    const gameId = await this.getGameId(appId);
    SteamClient.Apps.RunGame(gameId, "", -1, 100);

    PyInterop.log(`Running app/game. [DEBUG INFO] appId: ${appId}; gameId: ${gameId};`);

    return await gameStart;
  }

  static async terminateGame(appId: number) {
    // Currently Steam fails to properly set appid for non-Steam games :/
    const gameEnd = this.waitForGameLifetime(null, { initialTimeout: 1500, waitForStart: false, waitUntilNewEnd: true });
    const gameId = await this.getGameId(appId);
    SteamClient.Apps.TerminateApp(gameId, false);

    
    PyInterop.log(`Terminating app/game. [DEBUG INFO] appId: ${appId}; gameId: ${gameId};`);

    return await gameEnd;
  }

  static registerForAuthStateChange(onLogin: ((username?:string) => Promise<void>) | null, onLogout: (() => Promise<void>) | null, once: boolean): { unregister: () => void } {
    try {
      let isLoggedIn: boolean | null = null;
      return SteamClient.User.RegisterForLoginStateChange((username: string) => {
        if (username === "") {
          if (isLoggedIn !== false && (once ? !SteamUtils.hasLoggedOut : true)) {
            if (onLogout) onLogout();
            PyInterop.log("User logged out.");
          }
          isLoggedIn = false;
        } else {
          if (isLoggedIn !== true && (once ? !SteamUtils.hasLoggedIn : true)) {
            if (onLogin) onLogin(username);
            PyInterop.log(`user logged in. [DEBUG INFO] username: ${username};`);
          }
          isLoggedIn = true;
        }
      }).unregister;
    } catch (error) {
      PyInterop.log(`error with AuthStateChange hook. [DEBUG INFO] error: ${error};`);
      // @ts-ignore
      return () => { };
    }
  }

  static restartClient() {
    SteamClient.User.StartRestart();
  }
}