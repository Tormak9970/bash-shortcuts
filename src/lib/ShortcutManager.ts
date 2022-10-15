import { afterPatch, Router, ServerAPI } from "decky-frontend-lib";
import { ReactElement } from "react";
import { showToast } from "../components/utils/Toast";
import { Shortcut } from "./data-structures/Shortcut";
import { LifetimeNotification, SteamShortcut } from "./SteamClient";
import { SteamUtils } from "./SteamUtils";


export class ShortcutManager {
    static appId:number;

    private static server:ServerAPI;
    private static routePath = "/library/app/:appid";
    private static routerPatch:any;

    private static shortcutName:string;
    private static runnerPath = "\"/home/deck/homebrew/plugins/bash-shortcuts/shortcutsRunner.sh\"";
    private static startDir = "\"/home/deck/homebrew/plugins/bash-shortcuts/\"";

    static setServer(server:ServerAPI) {
        this.server = server;
    }

    static async init(name:string) {
        this.shortcutName = name;
        if (!(await this.checkShortcutExist(this.shortcutName))) {
            const success = await this.addShortcut(this.shortcutName, this.runnerPath);

            if (!success) {
                console.log("Adding runner shortcut failed");
                showToast("Adding runner shortcut failed");
            }
        } else {
            const shorcut = await SteamUtils.getShortcut(name) as SteamShortcut;
            if (shorcut) {
                if (shorcut.data.strExePath != this.runnerPath) {
                    const res = await SteamUtils.setShortcutExe(shorcut.appid, this.runnerPath);
                    if (!res) {
                        console.log("Failed to set the shortcutsRunner path");
                        showToast("Failed to set the shortcutsRunner path");
                    }
                }
                console.log(shorcut);
                // TODO these aren't ever equal. for now it works to confirm its correct by resetting it.
                if (shorcut.data.strShortcutPath != this.startDir) {
                    const res = await SteamUtils.setShortcutStartDir(shorcut.appid, this.startDir);
                    if (!res) {
                        console.log("Failed to set the start dir");
                        showToast("Failed to set the start dir");
                    }
                }
                this.appId = shorcut.appid;
            } else {
                console.log("failed to get shortcut but it exists");
                showToast("Failed to get shortcut but it exists. Please try restarting your Deck.");
            }
        }

        if (this.appId) {
            this.routerPatch = this.server.routerHook.addPatch(this.routePath, (routeProps: { path: string; children: ReactElement }) => {
                afterPatch(routeProps.children.props, "renderFunc", (_args: any[], ret:ReactElement) => {
                    const { appid } = ret.props.children.props.overview;

                    if (appid === this.appId) {
                        console.log("rerouting");
                        Router.Navigate('/library/home');
                        return null;
                    }

                    return ret;
                });

                return routeProps;
            });
        }
    }

    static onDismount() {
        this.server.routerHook.removePatch(this.routePath, this.routerPatch);
    }

    static async getShortcuts() {
        const res = await SteamUtils.getShortcuts();
        return res;
    }

    static async launchShortcut(shortcut:Shortcut, setIsRunning:(value:boolean) => void): Promise<boolean> {
        const didSetLaunchOpts = await SteamUtils.setAppLaunchOptions(this.appId, shortcut.cmd); 
        if (didSetLaunchOpts) {
            Router.CloseSideMenus();
            const didLaunch = await SteamUtils.runGame(this.appId, false);
            if (didLaunch) {
                console.log("shortcut is now running");
                setIsRunning(true);
            }
            const unregister = SteamUtils.registerForGameLifetime((data: LifetimeNotification) => {
                if (data.bRunning) return;
                console.log("shortcut is now terminated");
                setIsRunning(false);

                unregister();
            });

            return didLaunch;
        } else {
            console.log("Failed at setAppLaunchOptions");
            showToast("Failed at setAppLaunchOptions");
            return false;
        }
    }

    static async closeGame(): Promise<boolean> {
        Router.CloseSideMenus();
        const status = await SteamUtils.terminateGame(this.appId);
        return status;
    }

    private static async checkShortcutExist(name:string): Promise<boolean> {
        return !!(await SteamUtils.getShortcut(name));
    }

    private static async addShortcut(name:string, exec:string): Promise<boolean> {
        const res = await SteamUtils.addShortcut(name, exec);
        if (res) {
            this.appId = res as number;
            return true; 
        } else {
            console.log("Failed to add shortcut");
            showToast("Failed to add shortcut");
            return false;
        }
    }

    // @ts-ignore
    private static async removeShortcut(name:string): Promise<boolean> {
        const shortcut = await SteamUtils.getShortcut(name);
        if (shortcut) {
            return !!(await SteamUtils.removeShortcut(shortcut.appid));
        } else {
            console.log("Failed to remove shortcut");
            showToast("Failed to remove shortcut");
            return false;
        }
    }
}