export class Shortcut {
  id: string;
  name: string;
  cmd: string;
  position: number;
  isApp: boolean;

  constructor(id: string, name: string, cmd: string, position: number, isApp: boolean) {
    this.id = id;
    this.name = name;
    this.cmd = cmd;
    this.position = position;
    this.isApp = isApp;
  }

  static fromJSON(json: any) {
    return new Shortcut(json.id, json.name, json.cmd, json.position, json.isApp);
  }
}