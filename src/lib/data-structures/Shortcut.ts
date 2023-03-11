import { Hook } from "../controllers/HookController";

/**
 * Contains all of the nessesary information on each shortcut.
 */
export class Shortcut {
  id: string;
  name: string;
  cmd: string;
  position: number;
  isApp: boolean;
  hooks: Hook[];

  /**
   * Creates a new Shortcut.
   * @param id The id of the shortcut.
   * @param name The name/lable of the shortcut.
   * @param cmd The command the shortcut runs.
   * @param position The position of the shortcut in the list of shortcuts.
   * @param isApp Whether the shortcut is an app or not.
   * @param hooks The list of hooks for this shortcut.
   */
  constructor(id: string, name: string, cmd: string, position: number, isApp: boolean, hooks: Hook[]) {
    this.id = id;
    this.name = name;
    this.cmd = cmd;
    this.position = position;
    this.isApp = isApp;
    this.hooks = hooks;
  }

  /**
   * Creates a new Shortcut from the provided json data.
   * @param json The json data to use for the shortcut.
   * @returns A new Shortcut.
   */
  static fromJSON(json: any): Shortcut {
    return new Shortcut(json.id, json.name, json.cmd, json.position, json.isApp, json.hooks);
  }
}