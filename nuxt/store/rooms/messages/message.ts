export class Message {
  id: string;
  text: string;
  sender: string;
  time: number;
  edited: boolean;

  constructor(
    id: string,
    text: string,
    sender: string,
    time: string,
    edited: boolean
  ) {
    this.id = id;
    this.text = text;
    this.sender = sender;
    this.time = new Date(time).getTime();
    this.edited = edited;
  }
}
