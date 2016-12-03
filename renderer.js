// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//
const now             = document.querySelector('.js-now');
const input           = document.querySelector('.js-next');
const timeDisplay     = document.querySelector('.js-timeDisplay');
const foothold        = document.querySelector('.js-foothold');
const ipc             = require('electron').ipcRenderer;
const defaultFontSize = parseInt(window.getComputedStyle(input)['font-size']);

const start  = +new Date;
let stack    = [];

window.stack = stack;
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
  // These values are arbitrary and can and should be tweaked
  if( input.scrollHeight > document.body.clientHeight * .75 ) {
    const fontSize = parseInt(window.getComputedStyle(input)['font-size']) * .9;
    input.style.fontSize = `${fontSize}px`;
  }
  if( input.scrollHeight < document.body.clientHeight * .5 ) {
    const fontSize = Math.min(defaultFontSize, parseInt(window.getComputedStyle(input)['font-size']) * 1.5);
    input.style.fontSize = `${fontSize}px`;
  }

}
input.addEventListener('change', resize);
input.addEventListener('cut', ()     => setTimeout(resize));
input.addEventListener('paste', ()   => setTimeout(resize));
input.addEventListener('drop', ()    => setTimeout(resize));
input.addEventListener('keydown', () => setTimeout(resize));

function push(name) {
  if( !name ) { console.warn("No name provided"); return cancel(); }

  stack.unshift({start: +new Date, name: name});
  cancel();
}

function cancel() {
  input.style.display = 'none';
  input.value         = '';
  now.style.display   = 'block';
  now.innerHTML       = stack[0].name;
  if( stack[1] ) {
    foothold.innerHTML  = stack[1].name;
  }
  listen();
}

function startInput() {
  // Show and focus input.
  input.style.display = 'block';
  input.focus();

  // Hide and clear displayed text.
  now.style.display   = 'none';
  now.innerHTML       = '';

  // Set foothold to currently displayed text.
  foothold.innerHTML  = stack[0].name;
}

function listen() {
  document.body.addEventListener('keypress', function showTextbox(event) {
    if( !event.key.match(/^[A-z0-9]$/) ) { return; }

    startInput();
    document.body.removeEventListener('keypress', showTextbox);
  })
}

push('do one thing');
