// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//
const input       = document.querySelector('.js-next');
const timeDisplay = document.querySelector('.js-timeDisplay');
const foothold    = document.querySelector('.js-foothold');
const ipc         = require('electron').ipcRenderer;

const start = +new Date;

window.input = input;

setInterval(function() {
  let diff = +new Date - start;

  timeDisplay.innerHTML = `${Math.floor(diff / 1000)}s`
}, 1000);

ipc.on('focus', function(event , data) {
  input.focus();
});

input.addEventListener('keypress', function(event) {
  if( event.which == 13 ) {
    console.log("Got enter");
    event.preventDefault();
    return false;
  }
})
