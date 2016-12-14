// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//
const ipc             = require('electron').ipcRenderer;
const store           = require('./js/store');
const storer          = require('./js/storer');
const start  = +new Date;
let stack    = [];

store.subscribe(function() {
  console.debug('State is now', store.getState());
  const state = store.getState();

  if( state.reading || state.map || state.sawdust ) {
    ignore();
  } else {
    listen();
  }

  storer.saveStack(state.stack);
})
const hopper   = require('./components/hopper')(store);
const map      = require('./components/map')(store);
const foothold = require('./components/foothold')(store);
const sawdust  = require('./components/sawdust')(store);
const reader   = require('./components/reader')(store);

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
      store.dispatch({type: 'pop'});
      listen();
    })
    return false;
  }
}

function escape(event) {
  if( event.which != 27 ) { return; }
  event.preventDefault();

  const state = store.getState();
  if( state.map ) {
    store.dispatch({type: 'hideMap'});
  } else if( state.sawdust ) {
    store.dispatch({type: 'hideSawdust'});
  } else {
    // eventually this will save records of bailure in the data model
    store.dispatch({type: 'pop'});
  }

  listen();
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

listen();
document.body.addEventListener('keydown', escape);
storer.retrieveStack(function(err, savedStack) {
  if( err ) { return console.warn(err); }
  if( !savedStack ) { return; }
  store.dispatch({type: 'loadStack', stack: savedStack});
})
