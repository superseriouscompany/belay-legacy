// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//
const input       = document.querySelector('input');
const timeDisplay = document.querySelector('.js-timeDisplay')

const start = +new Date;

setInterval(function() {
  let diff = +new Date - start;

  timeDisplay.innerHTML = `${Math.floor(diff / 1000)}s`
}, 1000);

document.querySelector('input').addEventListener('click', function() {
  console.log("clicked");
})
