// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//
const input           = document.querySelector('.js-next');
const timeDisplay     = document.querySelector('.js-timeDisplay');
const foothold        = document.querySelector('.js-foothold');
const hint            = document.querySelector('.js-hint');
const sawdust         = document.querySelector('.js-sawdust');
const ipc             = require('electron').ipcRenderer;
const storage         = require('electron-json-storage');
const store           = require('./js/store');
const defaultFontSize = parseInt(window.getComputedStyle(input)['font-size']);

const start  = +new Date;
let stack    = [];

store.subscribe(function(nice) {
  console.debug('State is now', store.getState());
})
store.subscribe(render)
const hopper = require('./components/hopper')(store);
const map    = require('./components/map')(store);

function render() {
  const stack = store.getState();

  // glue code for old calls
  input.style.display = 'none';
  input.value         = '';
  if( !stack.length ) { timeDisplay.innerHTML = ''; }
  listen();
}

function listen() {
  ignore();
  document.body.addEventListener('keypress', keypress);
  document.body.addEventListener('keydown', keydown);
  document.body.addEventListener('keyup', keyup);
  document.body.addEventListener('click', hinter.show);
}

function ignore() {
  document.body.removeEventListener('keypress', keypress);
  document.body.removeEventListener('keydown', keydown);
  document.body.removeEventListener('keyup', keyup);
  document.body.removeEventListener('click', hinter.show);
}

function keypress(event) {
  event.key = event.key || String.fromCharCode(event.keyCode);
  if( !event.key.match(/^[A-z0-9]$/) ) { return; }

  reader.start();
  hinter.hide();
  ignore();
}

function keydown(event) {
  if( event.which == 8 ) { // backspace
    event.preventDefault();

    hopper.explode(function() {
      stacker.pop();
      hinter.hide();
    })
    return false;
  } else if( event.which == 27 ) {
    event.preventDefault();
    stacker.abort();
    hinter.hide();
    store.dispatch({type: 'hideMap'});
  }
}

function keyup(event) {
  if( event.which == 16 ) { // shift
    event.preventDefault();
    ignore();
    if( event.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT ) {
      store.dispatch({type: 'showMap'});
    } else {
      sawduster.show();
    }
  }
}

const hinter = {
  show: function() {
    hint.style.display = 'block';
    if( stack.length ) {
      hint.innerHTML = '(backspace to finish, escape to bail)'
    } else {
      hint.innerHTML = '(start typing)'
    }
  },

  hide: function() {
    hint.style.display = 'none';
  },
}

let inputLength = 0;
const reader = {
  start: function() {
    store.dispatch({type: 'startReading'});

    // Show and focus input.
    input.style.display = 'block';
    input.focus();

    // Set foothold to currently displayed text.
    foothold.innerHTML  = stack[0] && stack[0].name || "";
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
  listen: function() {
    document.body.addEventListener('keydown', function(event) {
      if( event.which != 27 ) { return; } // ESC
      if( sawdust.style.display != 'block' ) { return; }
      sawduster.hide();
    })
    storer.retrieveSawdust(function(err, savedSawdust) {
      if( err ) { return console.warn(err); }
      if( savedSawdust ) { sawdust.value = savedSawdust; }
    })
  },

  show: function() {
    const val = sawdust.value;
    sawdust.value = '';
    sawdust.value = val;
    sawdust.style.display = 'block';
    sawdust.focus();
  },

  hide: function() {
    sawdust.style.display = 'none';

    sawdust.value = sawdust.value.trim();
    if( sawdust.value && sawdust.value[sawdust.value.length-1] != "\n" ) {
      sawdust.value += "\n";
    }

    storer.saveSawdust(sawdust.value, function(err) {
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

const timer = {
  start: function() {
    setInterval(function() {
      if( !stack.length ) { return; }
      timeDisplay.innerHTML = timer.renderTime(stack[0].start);
    }, 1000);
  },

  renderTime: function(since) {
    let diff = (+new Date - since)/1000;

    const hours   = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = Math.floor(diff % 60);

    if( hours ) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if( minutes ) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
}

reader.listen();
sawduster.listen();
timer.start();
storer.retrieveStack(function(err, savedStack) {
  if( err ) { return console.warn(err); }
  if( !savedStack ) { return; }
  store.dispatch({type: 'loadStack', stack: savedStack});
})
