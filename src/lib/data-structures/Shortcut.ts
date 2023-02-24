/**
 * Contains all of the nessesary information on each shortcut.
 */
export class Shortcut {
  id: string;
  name: string;
  cmd: string;
  position: number;
  isApp: boolean;
  isRunning: boolean;

  /**
   * Creates a new Shortcut.
   * @param id The id of the shortcut.
   * @param name The name/lable of the shortcut.
   * @param cmd The command the shortcut runs.
   * @param position The position of the shortcut in the list of shortcuts.
   * @param isApp Whether the shortcut is an app or not.
   * @param isRunning Whether the shortcut is running currently.
   */
  constructor(id: string, name: string, cmd: string, position: number, isApp: boolean, isRunning:boolean) {
    this.id = id;
    this.name = name;
    this.cmd = cmd;
    this.position = position;
    this.isApp = isApp;
    this.isRunning = isRunning;
  }

  static fromJSON(json: any) {
    return new Shortcut(json.id, json.name, json.cmd, json.position, json.isApp, json.isRunning);
  }
}