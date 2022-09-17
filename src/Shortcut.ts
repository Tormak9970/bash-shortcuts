export class Shortcut {
    private _id:string;
    private _name:string;
    private _cmd:string;

    constructor(id:string, name:string, cmd:string) {
        this._id = id;
        this._name = name;
        this._cmd = cmd;
    }

    get id() { return this._id; }
    get name() { return this._name; }
    get cmd() { return this._cmd; }

    static fromJSON(json:any) {
        return new Shortcut(json.id, json.name, json.cmd);
    }
}