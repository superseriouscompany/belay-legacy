// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//
const input           = document.querySelector('.js-next');
const ipc             = require('electron').ipcRenderer;
const storage         = require('electron-json-storage');
const store           = require('./js/store');
const defaultFontSize = parseInt(window.getComputedStyle(input)['font-size']);

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

function render() {
  const stack = store.getState();

  // glue code for old calls
  input.style.display = 'none';
  input.value         = '';
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

  reader.start();
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
    sawduster.hide();
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

let inputLength = 0;
const reader = {
  start: function() {
    store.dispatch({type: 'startReading'});

    // Show and focus input.
    input.style.display = 'block';
    input.focus();
  },

  listen: function() {
    input.addEventListener('keypress', function(event) {
      if( event.which != 13 ) { return; } // ENTER
      stacker.push(input.value);
      event.preventDefault();
      return false;
    })

    input.addEventListener('keydown', function(event) {
      if( event.which != 27 ) { return; } // ESC
      render(stack);
    })

    input.addEventListener('change', reader.resize);
    input.addEventListener('cut', ()     => setTimeout(reader.resize));
    input.addEventListener('paste', ()   => setTimeout(reader.resize));
    input.addEventListener('drop', ()    => setTimeout(reader.resize));
    input.addEventListener('keydown', () => setTimeout(reader.resize));
  },

  resize: function() {
    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 'px';
    // The textarea wants to be two lines when it should only be one
    if( input.scrollHeight == 168 ) {
      input.style.height = '84px';
    }

    // These values are arbitrary and can and should be tweaked
    if( input.scrollHeight > document.body.clientHeight * .75 ) {
      const fontSize = parseInt(window.getComputedStyle(input)['font-size']) * .9;
      input.style.fontSize = `${fontSize}px`;
    }
    if( input.scrollHeight < document.body.clientHeight * .5 ) {
      const fontSize = Math.min(defaultFontSize, parseInt(window.getComputedStyle(input)['font-size']) * 1.5);
      input.style.fontSize = `${fontSize}px`;
    }
  },
}

const sawduster = {
  hide: function() {
    $sawdust.value = $sawdust.value.trim();
    if( $sawdust.value && $sawdust.value[$sawdust.value.length-1] != "\n" ) {
      $sawdust.value += "\n";
    }

    storer.saveSawdust($sawdust.value, function(err) {
      if( err ) { return console.error(err); }
      listen();
    })
  },
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

const storer = {
  saveStack: function(stack, cb) {
    return storage.set('stack', {stack: stack}, cb);
  },
  retrieveStack: function(cb) {
    return storage.get('stack', function(err, payload) {
      if( err ) { return cb(err); }
      return cb(null, payload.stack);
    })
  },
  saveSawdust: function(sawdust, cb) {
    return storage.set('sawdust', {sawdust: sawdust}, cb);
  },
  retrieveSawdust: function(cb) {
    return storage.get('sawdust', function(err, payload) {
      if( err ) { return cb(err); }
      return cb(null, payload.sawdust);
    })
  },
}

reader.listen();
storer.retrieveStack(function(err, savedStack) {
  if( err ) { return console.warn(err); }
  if( !savedStack ) { return; }
  store.dispatch({type: 'loadStack', stack: savedStack});
})
storer.retrieveSawdust(function(err, savedSawdust) {
  if( err ) { return console.warn(err); }
  if( savedSawdust ) { $sawdust.value = savedSawdust; }
})
