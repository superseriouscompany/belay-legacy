// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//
const now         = document.querySelector('.js-now');
const input       = document.querySelector('.js-next');
const timeDisplay = document.querySelector('.js-timeDisplay');
const foothold    = document.querySelector('.js-foothold');
const ipc         = require('electron').ipcRenderer;

const start  = +new Date;
let stack    = [];

window.input = input;

setInterval(function() {
  if( !stack.length ) { return; }
  let diff = +new Date - stack[0].start;

  timeDisplay.innerHTML = `${Math.floor(diff / 1000)}s`
}, 1000);

input.addEventListener('keypress', function(event) {
  if( event.which == 13 ) { // ENTER
    push(input.value);
    event.preventDefault();
    return false;
  }

  if( event.which == 27 ) { // ESC
    cancel();
    event.preventDefault();
    return false;
  }
})

function resize() {
  input.style.height = 'auto';
  input.style.height = input.scrollHeight + 'px';
}
input.addEventListener('change', resize);
input.addEventListener('cut', () => setTimeout(resize));
input.addEventListener('paste', () => setTimeout(resize));
input.addEventListener('drop', () => setTimeout(resize));
input.addEventListener('keydown', () => setTimeout(resize));

function prepTextbox() {
  document.body.addEventListener('keypress', function showTextbox(event) {
    if( !event.key.match(/^[A-z0-9]$/) ) { return; }

    document.body.removeEventListener('keypress', showTextbox);
    listen();
  })
}

function push(name) {
  stack.unshift({start: +new Date, name: name});
  console.log("stack is now", stack);
  cancel();
}

function listen() {
  input.style.display = 'block';
  input.value         = event.key;
  now.style.display   = 'none';
  now.innerHTML       = '';
  foothold.innerHTML  = stack[0].name;
}

function cancel() {
  input.style.display = 'none';
  input.value         = '';
  now.style.display   = 'block';
  now.innerHTML       = stack[0].name;
  if( stack[1] ) {
    foothold.innerHTML  = stack[1].name;
  }
  prepTextbox();
}

push('do one thing');
