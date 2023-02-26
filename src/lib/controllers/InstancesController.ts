import { Instance } from "../data-structures/Instance";
import { Shortcut } from "../data-structures/Shortcut";
import { ShortcutsController } from "./ShortcutsController";
import { PyInterop } from "../../PyInterop";
import { Navigation } from "decky-frontend-lib";

/**
 * Controller for managing plugin instances.
 */
export class InstancesController {
  private shorcutsController:ShortcutsController;

  numInstances: number;
  instances: { [uuid:string]: Instance };

  /**
   * Creates a new InstancesController.
   * @param shortcutsController The shortcuts controller used by this class.
   */
  constructor(shortcutsController: ShortcutsController) {
    this.shorcutsController = shortcutsController;

    this.numInstances = 0;
    this.instances = {};
  }

  /**
   * Launches an instance.
   * @param shortcutId The id of the shortcut associated with the instance to launch.
   * @returns A promise resolving to true if the instance is launched.
   */
  async launchInstance(shortcutId: string): Promise<boolean> {
    const instance = this.instances[shortcutId];
    
    if (instance.shortcutIsApp) {
      const res = await this.shorcutsController.launchShortcut(instance.unAppID as number);

      if (!res) {
        PyInterop.log(`Failed to launch instance. InstanceName: ${instance.steamShortcutName} ShortcutId: ${shortcutId}`);
      }
      
      return res;
    } else {
      //TODO: handle launching non app shortcuts here
      // const res = await PyInterop.runNonAppShortcut(shortcut);
      // const status = typeof res.result == "boolean" && (res.result as boolean);
      // if (status) {
      //   shortcut.isRunning = true;
        
      //   PyInterop.toast("Success", "Command exited successfully!");
      // }
      // return status;
      PyInterop.log(`Launching is not implemented for non app shortcuts yet.`);
      return false;
    }
  }

  /**
   * Starts a new instance for a shortcut.
   * @param baseName The base name for instances.
   * @param shortcut The shortcut to make an instance for.
   * @param exec The exe for the shortcut.
   * @param startDir The start directory for the shortcut.
   * @returns A promise resolving to true if all the steamClient calls were successful.
   */
  async startInstance(baseName: string, shortcut: Shortcut, exec: string, startDir: string): Promise<boolean> {
    this.numInstances++;
    const shortcutName = `${baseName} - Instance ${this.numInstances}`;

    if (shortcut.isApp) {
      let appId = null;
      
      //* check if instance exists. if so, grab it and modify it
      if (await this.shorcutsController.checkShortcutExist(shortcutName)) {
        const shortcut = await this.shorcutsController.getShortcut(shortcutName);
        appId = shortcut?.unAppID;
      } else {
        appId = await this.shorcutsController.addShortcut(shortcutName, exec);
      }

      if (appId) {
        this.instances[shortcut.id] = new Instance(appId, shortcutName, shortcut.id, shortcut.isApp);
        
        const exeRes = await this.shorcutsController.setShortcutExe(appId, exec);
        if (!exeRes) {
          PyInterop.toast("Error", "Failed to set the shortcutsRunner path");
          return false;
        }
        
        const startDirRes = await this.shorcutsController.setShortcutStartDir(appId, startDir);
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

      const res = await this.shorcutsController.closeShortcut(appId);

      Navigation.Navigate("/library/home");
      Navigation.CloseSideMenus();
  
      if (res) {
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
        PyInterop.log(`Failed to kill instance. Could not close shortcut. Id: ${shortcutId} InstanceName: ${instance.steamShortcutName}`);
        return false;
      }
    } else {
      //TODO: handle killing non app shortcuts here
      PyInterop.log(`Killing is not implemented for non app shortcuts yet.`);
      return false;
    }
  }
}