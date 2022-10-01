import { sleep } from "decky-frontend-lib";
import { SteamClient, SteamShortcut } from "./SteamClient";

//? Credit to FrogTheFrog for some of the methods: https://github.com/FrogTheFrog/SDH-MoonDeck/blob/main/src/lib/steamutils.ts

declare global {
    var SteamClient: SteamClient;
}

interface AppDetails {
    unAppID: number;
    strLaunchOptions: string;
}

interface AppOverview {
    display_name: string;
    gameid: string;
}

export class SteamUtils {
    static async getShortcuts(): Promise<SteamShortcut[]> {
        const res = await SteamClient.Apps.GetAllShortcuts();
        return res as SteamShortcut[];
    }
    
    static async getShortcut(appName:string): Promise<SteamShortcut|undefined> {
        const res = await SteamClient.Apps.GetAllShortcuts();
        const shortcutsList = res as SteamShortcut[];

        return shortcutsList.find((s:SteamShortcut) => s.data.strAppName == appName);
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
                return true;
            }
            if (retries > 0) {
                await sleep(250);
            }
        }

        return false;
    }

    static async hideApp(appId: number) {
        if (!await this.waitForAppOverview(appId, (overview) => overview !== null)) {
            console.error(`Could not hide app ${appId}!`);
            return false;
        }

        const { collectionStore } = (window as any);
        if (collectionStore.BIsHidden(appId)) {
            return true;
        }

        collectionStore.SetAppsAsHidden([appId], true);

        let retries = 4;
        while (retries--) {
            if (collectionStore.BIsHidden(appId)) {
                return true;
            }
            if (retries > 0) {
                await sleep(250);
            }
        }

        return false;
    }

    static async addShortcut(appName: string, execPath: string) {
        console.log(`Adding shortcut for ${appName}.`);

        const appId = await SteamClient.Apps.AddShortcut(appName, execPath) as number | undefined | null;
        if (typeof appId === "number") {
            if (await this.waitForAppOverview(appId, (overview) => overview !== null)) {
                const overview = await this.getAppOverview(appId);
                if (overview && overview.display_name === appName) {
                    if (await this.hideApp(appId)) {
                        return appId;
                    }
                }
            }

            await this.removeShortcut(appId);
        }

        console.error(`Could not add shortcut for ${appName}!`);
        return null;
    }

    // TODO: check if steam still gets into angry state :/
    static async removeShortcut(appId: number) {
        const overview = await this.waitForAppOverview(appId, (overview) => overview !== null) ? await this.getAppOverview(appId) : null;
        if (!overview) {
            console.warn(`Could not remove shortcut for ${appId} (does not exist)!`);
            return true;
        }

        const { collectionStore } = (window as any);
        const collections = collectionStore.userCollections;

        console.log(`Removing shortcut for ${appId}.`);
        SteamClient.Apps.RemoveShortcut(appId);
        for (const collection of collections) {
            if (collection.bAllowsDragAndDrop && collection.apps.has(appId)) {
                console.log(`Removing ${appId} from ${collection}`);
                collection.AsDragDropCollection().RemoveApps([overview]);
            }
        }

        if (!await this.waitForAppOverview(appId, (overview) => overview === null)) {
            console.error(`Could not remove shortcut for ${appId}!`);
            return false;
        }

        return true;
    }

    static async setAppLaunchOptions(appId: number, options: string) {
        const details = await this.waitForAppDetails(appId, (details) => details !== null) ? await this.getAppDetails(appId) : null;
        if (!details) {
            console.error(`Could not add launch options for ${appId} (does not exist)!`);
            return false;
        }

        if (details.strLaunchOptions === options) {
            return true;
        }

        SteamClient.Apps.SetAppLaunchOptions(appId, options);
        if (!await this.waitForAppDetails(appId, (details) => details !== null && details.strLaunchOptions === options)) {
            console.error(`Could not add launch options for ${appId}!`);
            return false;
        }
        return true;
    }

    static restartClient() {
        SteamClient.User.StartRestart();
    }
}