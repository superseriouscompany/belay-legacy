// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//
const ipc             = require('electron').ipcRenderer;
const store           = require('./js/store');
const storer          = require('./js/storer');
const start  = +new Date;
let stack    = [];

const $sawdust         = document.querySelector('.js-sawdust');

store.subscribe(function(nice) {
  console.debug('State is now', store.getState());
})
store.subscribe(render)
const hopper   = require('./components/hopper')(store);
const map      = require('./components/map')(store);
const foothold = require('./components/foothold')(store);
const sawdust  = require('./components/sawdust')(store);
const reader   = require('./components/reader')(store);

function render() {
  listen();
}

function listen() {
  ignore();
  document.body.addEventListener('keypress', keypress);
  document.body.addEventListener('keydown', keydown);
  document.body.addEventListener('keyup', keyup);
}

function ignore() {
  document.body.removeEventListener('keypress', keypress);
  document.body.removeEventListener('keydown', keydown);
  document.body.removeEventListener('keyup', keyup);
}

function keypress(event) {
  event.key = event.key || String.fromCharCode(event.keyCode);
  if( !event.key.match(/^[A-z0-9]$/) ) { return; }

  store.dispatch({type: 'startReading'});
  ignore();
}

function keydown(event) {
  if( event.which == 8 ) { // backspace
    event.preventDefault();

    hopper.explode(function() {
      stacker.pop();
    })
    return false;
  } else if( event.which == 27 ) {
    event.preventDefault();
    stacker.abort();
    store.dispatch({type: 'hideMap'});
    store.dispatch({type: 'hideSawdust'});
    storer.saveSawdust($sawdust.value, function(err) {
      if( err ) { return console.error(err); }
      listen();
    })
  }
}

function keyup(event) {
  if( event.which == 16 ) { // shift
    event.preventDefault();
    ignore();
    if( event.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT ) {
      store.dispatch({type: 'showMap'});
    } else {
      store.dispatch({type: 'showSawdust'});
    }
  }
}

const stacker = {
  push: function(name) {
    if( !name ) { return console.warn("No name provided"); }
    const task = {start: +new Date, name: name, fontSize: window.getComputedStyle(input)['font-size']}
    store.dispatch({type: 'stopReading'});
    store.dispatch({type: 'push', task: task});
    stack.unshift(task);
    storer.saveStack(stack);
  },

  pop: function() {
    store.dispatch({type: 'pop'});
    stack.shift();
    storer.saveStack(stack);
  },

  abort: function() {
    // eventually this will save records of bailure in the data model
    stacker.pop();
  }
}

storer.retrieveStack(function(err, savedStack) {
  if( err ) { return console.warn(err); }
  if( !savedStack ) { return; }
  store.dispatch({type: 'loadStack', stack: savedStack});
})
storer.retrieveSawdust(function(err, savedSawdust) {
  if( err ) { return console.warn(err); }
  if( savedSawdust ) { $sawdust.value = savedSawdust; }
})
