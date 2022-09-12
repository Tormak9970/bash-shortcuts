export class Shortcut {
    private _id:string;
    private _name:string;
    private _icon:string;
    private _path:string;

    constructor(id:string, name:string, icon:string, path:string) {
        this._id = id;
        this._name = name;
        this._icon = icon;
        this._path = path;
    }

    get id() { return this._id; }
    get name() { return this._name; }
    get icon() { return this._icon; }
    get path() { return this._path; }

    static fromJSON(json:any) {
        return new Shortcut(json.id, json.name, json.icon, json.path);
    }
}