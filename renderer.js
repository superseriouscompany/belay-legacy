// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//
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
  if( event.which == 13 ) {
    stack.unshift({start: +new Date, name: input.value})
    event.preventDefault();
    input.style.display = 'hidden';
    return false;
  }
})

function prepTextbox() {
  document.body.addEventListener('keypress', function showTextbox(event) {
    if( !event.key.match(/^[A-z0-9]$/) ) { return; }

    document.body.removeEventListener('keypress', showTextbox);
    input.style.display = 'block';
    input.value = event.key;
  })
}
prepTextbox();
