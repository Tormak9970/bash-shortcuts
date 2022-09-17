import { ServerAPI, ServerResponse } from "decky-frontend-lib";
import { Shortcut } from "./Shortcut";

type ShortcutsDictionary = {
    [key:string]: Shortcut
}

interface launchAppArgs {
    name:string,
    cmd: string
}

export class PyInterop {
    private static serverAPI:ServerAPI;

    static setServer(serv:ServerAPI) {
        this.serverAPI = serv;
    }

    static get server() {
        return this.serverAPI;
    }

    static async getShortcuts(): Promise<ServerResponse<ShortcutsDictionary>> {
        return await this.serverAPI.callPluginMethod<{}, ShortcutsDictionary>("getShortcuts", {});
    }
    static async addShortcut(shortcut:Shortcut): Promise<ServerResponse<ShortcutsDictionary>> {
        return await this.serverAPI.callPluginMethod<{shortcut:Shortcut}, ShortcutsDictionary>("addShortcut", { shortcut: shortcut });
    }
    static async modShortcut(shortcut:Shortcut): Promise<ServerResponse<ShortcutsDictionary>> {
        return await this.serverAPI.callPluginMethod<{shortcut:Shortcut}, ShortcutsDictionary>("modShortcut", { shortcut: shortcut });
    }
    static async remShortcut(shortcut:Shortcut): Promise<ServerResponse<ShortcutsDictionary>> {
        return await this.serverAPI.callPluginMethod<{shortcut:Shortcut}, ShortcutsDictionary>("remShortcut", { shortcut: shortcut });
    }


    static async launchApp(name:string, cmd:string): Promise<void> {
        await this.serverAPI.callPluginMethod<launchAppArgs, void>("launchApp", { name: name, cmd: cmd });
    }
    static async getInstalledApps(): Promise<ServerResponse<Application[]>> {
        const apps = await this.serverAPI.callPluginMethod<{}, Application[]>("getInstalledApps", {});
        return apps;
    }
}