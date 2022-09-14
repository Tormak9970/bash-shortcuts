export class Shortcut {
    private _id:string;
    private _name:string;
    private _path:string;

    constructor(id:string, name:string, path:string) {
        this._id = id;
        this._name = name;
        this._path = path;
    }

    get id() { return this._id; }
    get name() { return this._name; }
    get path() { return this._path; }

    static fromJSON(json:any) {
        return new Shortcut(json.id, json.name, json.path);
    }
}