import { ServerAPI, ServerResponse } from "decky-frontend-lib";
import { Shortcut } from "./Shortcut";

type ShortcutsDictionary = {
    [key:string]: Shortcut
}

interface launchAppArgs {
    name:string,
    path: string
}

export class PyInterop {
    public static key = 0;
    private static serverAPI:ServerAPI;

    static setServer(serv:ServerAPI) {
        this.serverAPI = serv;
    }

    static get server() {
        return this.serverAPI;
    }

    static async getShortcuts(): Promise<ServerResponse<ShortcutsDictionary>> {
        return await this.serverAPI.callPluginMethod<{}, ShortcutsDictionary>("getShortcuts", {})
    }
    static async addShortcut(shortcut:Shortcut): Promise<ServerResponse<ShortcutsDictionary>> {
        return await this.serverAPI.callPluginMethod<{shortcut:Shortcut}, ShortcutsDictionary>("addShortcuts", { shortcut: shortcut });
    }
    static async modShortcut(shortcut:Shortcut): Promise<ServerResponse<ShortcutsDictionary>> {
        return await this.serverAPI.callPluginMethod<{shortcut:Shortcut}, ShortcutsDictionary>("modShortcuts", { shortcut: shortcut });
    }
    static async remShortcut(shortcut:Shortcut): Promise<ServerResponse<ShortcutsDictionary>> {
        return await this.serverAPI.callPluginMethod<{shortcut:Shortcut}, ShortcutsDictionary>("remShortcuts", { shortcut: shortcut });
    }


    static async launchApp(name:string, path:string): Promise<void> {
        await this.serverAPI.callPluginMethod<launchAppArgs, void>("launchApp", { name: name, path: path });
    }
    static async getInstalledApps(): Promise<ServerResponse<Application[]>> {
        const apps = await this.serverAPI.callPluginMethod<{}, Application[]>("getInstalledApps", {});
        return apps;
    }
    static async addManualShortcut(path:string): Promise<ServerResponse<ShortcutsDictionary>> {
        return await this.serverAPI.callPluginMethod<{ path: string }, ShortcutsDictionary>("addManualShortcut", { path: path });
    }
}