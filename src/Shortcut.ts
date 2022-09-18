export class Shortcut {
    id:string;
    name:string;
    cmd:string;

    constructor(id:string, name:string, cmd:string) {
        this.id = id;
        this.name = name;
        this.cmd = cmd;
    }

    static fromJSON(json:any) {
        return new Shortcut(json.id, json.name, json.cmd);
    }
}