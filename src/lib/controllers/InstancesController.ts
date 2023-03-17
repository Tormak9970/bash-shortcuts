import { Instance } from "../data-structures/Instance";
import { Shortcut } from "../data-structures/Shortcut";
import { ShortcutsController } from "./ShortcutsController";
import { PyInterop } from "../../PyInterop";
import { Navigation } from "decky-frontend-lib";
import { WebSocketClient } from "../../WebsocketClient";

/**
 * Controller for managing plugin instances.
 */
export class InstancesController {
  private baseName = "Bash Shortcuts";
  private runnerPath = "/home/deck/homebrew/plugins/bash-shortcuts/shortcutsRunner.sh";
  private startDir = "\"/home/deck/homebrew/plugins/bash-shortcuts/\"";
  private shorcutsController:ShortcutsController;
  private webSocketClient: WebSocketClient;

  numInstances: number;
  instances: { [uuid:string]: Instance };

  /**
   * Creates a new InstancesController.
   * @param shortcutsController The shortcuts controller used by this class.
   */
  constructor(shortcutsController: ShortcutsController, webSocketClient: WebSocketClient) {
    this.shorcutsController = shortcutsController;
    this.webSocketClient = webSocketClient;

    PyInterop.getHomeDir().then((res) => {
      this.runnerPath = `/home/${res.result}/homebrew/plugins/bash-shortcuts/shortcutsRunner.sh`;
      this.startDir = `\"/home/${res.result}/homebrew/plugins/bash-shortcuts/\"`;
    });

    this.numInstances = 0;
    this.instances = {};
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
   * Creates a new instance for a shortcut.
   * @param shortcut The shortcut to make an instance for.
   * @returns A promise resolving to true if all the steamClient calls were successful.
   */
  async createInstance(shortcut: Shortcut): Promise<boolean> {
    this.numInstances++;
    const shortcutName = `${this.baseName} - Instance ${this.numInstances}`;

    if (shortcut.isApp) {
      let appId = null;
      
      //* check if instance exists. if so, grab it and modify it
      if (await this.shorcutsController.checkShortcutExist(shortcutName)) {
        const shortcut = await this.shorcutsController.getShortcut(shortcutName);
        appId = shortcut?.unAppID;
      } else {
        appId = await this.shorcutsController.addShortcut(shortcutName, this.runnerPath);
      }

      if (appId) {
        this.instances[shortcut.id] = new Instance(appId, shortcutName, shortcut.id, shortcut.isApp);
        
        const exeRes = await this.shorcutsController.setShortcutExe(appId, this.runnerPath);
        if (!exeRes) {
          PyInterop.toast("Error", "Failed to set the shortcutsRunner path");
          return false;
        }
        
        const startDirRes = await this.shorcutsController.setShortcutStartDir(appId, this.startDir);
        if (!startDirRes) {
          PyInterop.toast("Error", "Failed to set the start dir");
          return false;
        }
        
        const launchOptsRes = await this.shorcutsController.setShortcutLaunchOptions(appId, shortcut.cmd);
        if (!launchOptsRes) {
          PyInterop.toast("Error", "Failed to set the launch options");
          return false;
        }

        return true;
      } else {
        this.numInstances--;
        PyInterop.log(`Failed to start instance. Id: ${shortcut.id} Name: ${shortcut.name}`);
        return false;
      }
    } else {
      PyInterop.log(`Shortcut is not an app. Skipping instance shortcut creation. ShortcutId: ${shortcut.id} ShortcutName: ${shortcut.name}`);
      this.instances[shortcut.id] = new Instance(null, shortcutName, shortcut.id, shortcut.isApp);

      PyInterop.log(`Adding websocket listener for message type ${shortcut.id}`);
      this.webSocketClient.on(shortcut.id, (data: any) => {
        if (data.type === "end") {
          delete this.instances[shortcut.id];
          PyInterop.log(`Removed non app instance for shortcut with Id: ${shortcut.id} because end was detected.`);
          setTimeout(() => {
            PyInterop.log(`Removing websocket listener for message type ${shortcut.id}`);
            this.webSocketClient.deleteListeners(shortcut.id);
          }, 2000);
        }
      });

      return true;
    }
  }

  /**
   * Kills a live shortcut instance.
   * @param shortcutId The id of the shortcut whose instance should be killed.
   * @returns A promise resolving to true if the instance was successfully killed.
   */
  async killInstance(shortcutId: string): Promise<boolean> {
    const instance = this.instances[shortcutId];

    if (instance.shortcutIsApp) {
      const appId = instance.unAppID as number;
      const success = await this.shorcutsController.removeShortcutById(appId);
  
      if (success) {
        PyInterop.log(`Killed instance. Id: ${shortcutId} InstanceName: ${instance.steamShortcutName}`);
        delete this.instances[shortcutId];
        this.numInstances--;

        return true;
      } else {
        PyInterop.log(`Failed to kill instance. Could not delete shortcut. Id: ${shortcutId} InstanceName: ${instance.steamShortcutName}`);
        return false;
      }
    } else {
      delete this.instances[shortcutId];
      const res = await PyInterop.killNonAppShortcut(shortcutId);
      console.log(res);

      this.webSocketClient.on(shortcutId, (data:any) => {
        if (data.type == "end") {
          setTimeout(() => {
            PyInterop.log(`Removing websocket listener for message type ${shortcutId}`);
            this.webSocketClient.deleteListeners(shortcutId);
          }, 2000);
        }
      });
      return true;
    }
  }

  /**
   * Launches an instance.
   * @param shortcutId The id of the shortcut associated with the instance to launch.
   * @param onExit The function to run when the shortcut closes.
   * @param flags Optional flags to pass to the shortcut.
   * @returns A promise resolving to true if the instance is launched.
   */
  async launchInstance(shortcutId: string, onExit: (data?: LifetimeNotification) => void, flags: { [flag: string]: string } = {}): Promise<boolean> {
    const instance = this.instances[shortcutId];
    
    if (instance.shortcutIsApp) {
      const appId = instance.unAppID as number;
      const res = await this.shorcutsController.launchShortcut(appId);

      if (!res) {
        PyInterop.log(`Failed to launch instance. InstanceName: ${instance.steamShortcutName} ShortcutId: ${shortcutId}`);
      } else {
        const { unregister } = this.shorcutsController.registerForShortcutExit(appId, (data: LifetimeNotification) => {
          onExit(data);
          unregister();
        });
      }
      
      return res;
    } else {
      const [ date, time ] = this.getDatetime();
      
      flags["d"] = date;
      flags["t"] = time;

      if (!Object.keys(flags).includes("u")) flags["u"] = loginStore.m_strAccountName;

      if (!Object.keys(flags).includes("i")) {

      }

      if (!Object.keys(flags).includes("n")) {

      }

      const res = await PyInterop.runNonAppShortcut(shortcutId, Object.entries(flags));
      console.log(res);
      return true;
    }
  }

  /**
   * Stops an instance.
   * @param shortcutId The id of the shortcut associated with the instance to stop.
   * @returns A promise resolving to true if the instance is stopped.
   */
  async stopInstance(shortcutId: string): Promise<boolean> {
    const instance = this.instances[shortcutId];

    if (instance.shortcutIsApp) {
      const appId = instance.unAppID as number;
      const res = await this.shorcutsController.closeShortcut(appId);

      Navigation.Navigate("/library/home");
      Navigation.CloseSideMenus();
  
      if (!res) {
        PyInterop.log(`Failed to stop instance. Could not close shortcut. Id: ${shortcutId} InstanceName: ${instance.steamShortcutName}`);
        return false;
      }
      
      return true;
    } else {
      //* atm nothing needed here
      // const res = await PyInterop.killNonAppShortcut(shortcutId);
      // console.log(res);
      return true;
    }
  }
}