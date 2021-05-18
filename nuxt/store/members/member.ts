export class Member {
  private _name: string;
  private _image: string;
  private _lastSeen: number | 'online';

  constructor(name: string, image: string, lastSeen: string) {
    this._name = name;
    this._image = image;
    this._lastSeen =
      lastSeen === 'online' ? 'online' : new Date(lastSeen).getTime() || 0;
  }

  get name() {
    return this._name;
  }

  get image() {
    return this._image;
  }

  get lastSeen() {
    return this._lastSeen;
  }

  set lastSeen(val) {
    this._lastSeen = val || Date.now();
  }
}
