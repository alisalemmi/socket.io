import { Socket } from 'socket.io-client';

// eslint-disable-next-line import/no-mutable-exports
let $socket: Socket;

export const initSocket = (socket: Socket) => {
  $socket = socket;
};

export { $socket };
