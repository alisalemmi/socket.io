export class Message {
  id: string;
  text: string;
  sender: string;
  time: number;
  edited: boolean;
  quoteRef?: string;

  constructor(
    id: string,
    text: string,
    sender: string,
    time: string,
    edited: boolean,
    quoteRef?: string
  ) {
    this.id = id;
    this.text = text;
    this.sender = sender;
    this.time = new Date(time).getTime();
    this.edited = edited;
    this.quoteRef = quoteRef;
  }
}
