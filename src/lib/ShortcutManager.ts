import { afterPatch, Router, ServerAPI } from "decky-frontend-lib";
import { ReactElement } from "react";
import { showToast } from "../components/utils/Toast";
import { Shortcut } from "./data-structures/Shortcut";
import { LifetimeNotification, SteamShortcut } from "./SteamClient";
import { SteamUtils } from "./SteamUtils";


export class ShortcutManager {
    public static shortcutIsRunning = false;

    private static server:ServerAPI;
    private static routePath = "/library/app/:appid";
    private static routerPatch:any;

    private static shortcutName:string;
    private static runnerPath = "/home/deck/homebrew/plugins/Shortcuts/shortcutsRunner.sh";
    static appId:number;

    public static setServer(server:ServerAPI) {
        this.server = server;
    }

    public static async init(name:string) {
        this.shortcutName = name;
        if (!(await this.checkShortcutExist(this.shortcutName))) {
            const success = await this.addShortcut(this.shortcutName, this.runnerPath);

            if (!success) console.log("Adding runner shortcut failed");
        } else {
            const shorcut = await SteamUtils.getShortcut(name) as SteamShortcut;
            this.appId = shorcut.appid;
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

    public static onDismount() {
        this.server.routerHook.removePatch(this.routePath, this.routerPatch);
    }

    public static async getShortcuts() {
        const res = await SteamUtils.getShortcuts();
        console.log(res);
    }

    public static async launchShortcut(shortcut:Shortcut, name = this.shortcutName): Promise<boolean> {
        const steamShort = await SteamUtils.getShortcut(name);
        if (steamShort) {
            const didSetLaunchOpts = await SteamUtils.setAppLaunchOptions((steamShort as SteamShortcut).appid, shortcut.cmd); 
            if (didSetLaunchOpts) {
                Router.CloseSideMenus();
                const didLaunch = await SteamUtils.runGame(steamShort.appid, false);
                // if (didLaunch) {
                //     this.shortcutIsRunning = true;
                // } else {
                //     showToast("Shortcut failed. Check the associated command.");
                // }
                // const unregister = SteamUtils.registerForGameLifetime((data: LifetimeNotification) => {
                //     if (data.unAppID !== this.appId) return;
    
                //     if (data.bRunning) return;
                //     this.shortcutIsRunning = false;
    
                //     unregister();
                // });

                return didLaunch;
            } else {
                console.log("Failed at setAppLaunchOptions");
                return false;
            }
        } else {
            console.log("Failed at getShortcut");
            return false;
        }
    }

    public static async closeGame() {
        return await SteamUtils.terminateGame(this.appId);
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
            return false;
        }
    }

    private static async removeShortcut(name:string): Promise<boolean> {
        const shortcut = await SteamUtils.getShortcut(name);
        if (shortcut) {
            return !!(await SteamUtils.removeShortcut(shortcut.appid));
        } else {
            return false;
        }
    }
}