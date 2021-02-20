/* global io */
/**
 * @type {import('socket.io').Socket}
 */
const socket = io();

const chats = document.querySelector('.chat__box');
const input = document.querySelector('#send__input');
const form = document.querySelector('#send');

form.addEventListener('submit', e => {
  e.preventDefault();
  socket.emit('send', { text: input.value });
  input.value = '';
});

socket.on('message', message => {
  chats.innerHTML += `<li class=''>${message.text}</li>`;
});
