const chats = document.querySelector('.chat__box');
const input = document.querySelector('#send__input');
const form = document.querySelector('#send');

form.addEventListener('submit', e => {
  e.preventDefault();
  input.value = '';
});
