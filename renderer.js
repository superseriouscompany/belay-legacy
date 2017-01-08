// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//
const ipc      = require('electron').ipcRenderer;
const store    = require('./js/store');

const hopper   = require('./components/hopper')(store);
const map      = require('./components/map')(store);
const foothold = require('./components/foothold')(store);
const sawdust  = require('./components/sawdust')(store);
const reader   = require('./components/reader')(store);

function listen() {
  ignore();
  document.body.addEventListener('keypress', startReading);
  document.body.addEventListener('keydown', pop);
  document.body.addEventListener('keyup', shift);
}

function ignore() {
  document.body.removeEventListener('keypress', startReading);
  document.body.removeEventListener('keydown', pop);
  document.body.removeEventListener('keyup', shift);
}

function startReading(event) {
  event.key = event.key || String.fromCharCode(event.keyCode);
  if( !event.key.match(/^[A-z0-9]$/) ) { return; }

  store.dispatch({type: 'startReading'});
  ignore();
}

function pop(event) {
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
  } else if( state.reading ) {
    store.dispatch({type: 'stopReading'});
  } else {
    // eventually this will save records of bailure in the data model
    store.dispatch({type: 'pop'});
  }

  listen();
}

function shift(event) {
  if( event.which != 16 ) { return; }
  event.preventDefault();
  ignore();
  if( event.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT ) {
    store.dispatch({type: 'showMap'});
  } else {
    store.dispatch({type: 'showSawdust'});
  }
}

document.body.addEventListener('keydown', escape);
store.subscribe(function() {
  console.debug('State is now', store.getState());
  const state = store.getState();

  if( state.reading || state.map || state.sawdust ) {
    ignore();
  } else {
    listen();
  }
})
