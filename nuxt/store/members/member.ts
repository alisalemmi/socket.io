export interface IUnparsedMember {
  id: string;
  name: string;
  image: string;
  lastSeen: string | 'online';
}

export interface IUserConnect {
  userId: string;
}

export interface IUserDisconnect {
  userId: string;
  time: string;
}

export class Member {
  name: string;
  image: string;
  private _lastSeen: number | 'online';

  constructor(name: string, image: string, lastSeen: string) {
    this.name = name;
    this.image = image;
    this._lastSeen =
      lastSeen === 'online' ? 'online' : new Date(lastSeen).getTime() || 0;
  }

  get lastSeen() {
    return this._lastSeen;
  }

  set lastSeen(val) {
    this._lastSeen = val || Date.now();
  }
}
