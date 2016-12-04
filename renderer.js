// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//
const now             = document.querySelector('.js-now');
const input           = document.querySelector('.js-next');
const timeDisplay     = document.querySelector('.js-timeDisplay');
const foothold        = document.querySelector('.js-foothold');
const hint            = document.querySelector('.js-hint');
const sawdust         = document.querySelector('.js-sawdust');
const ipc             = require('electron').ipcRenderer;
const storage         = require('electron-json-storage');
const defaultFontSize = parseInt(window.getComputedStyle(input)['font-size']);

const start  = +new Date;
let stack    = [];

function render() {
  input.style.display = 'none';
  input.value         = '';
  now.style.display   = 'block';
  if( stack.length ) {
    now.innerHTML = stack[0].name;
    if( stack[0].fontSize ) {
      now.style.fontSize = stack[0].fontSize;
    }
    foothold.innerHTML = stack[1] && stack[1].name || "";
  } else {
    now.innerHTML = 'Do one thing.'
    timeDisplay.innerHTML = '';
  }
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
    tasker.explode(function() {
      stacker.pop();
      hinter.hide();
    })
    return false;
  }
}

function keyup(event) {
  if( event.which == 16 ) {
    event.preventDefault();
    sawduster.show();
  }
}

const hinter = {
  show: function() {
    hint.style.display = 'block';
    if( stack.length ) {
      hint.innerHTML = '(backspace to finish)'
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
    // Show and focus input.
    input.style.display = 'block';
    input.focus();

    // Hide and clear displayed text.
    now.style.display   = 'none';
    now.innerHTML       = '';

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
      render();
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
    sawdust.addEventListener('keydown', function(event) {
      if( event.which != 27 ) { return; } // ESC or shift

      sawduster.hide();
    })
  },

  show: function() {
    sawdust.style.display = 'block';
    sawdust.focus();
    ignore();
  },

  hide: function() {
    sawdust.style.display = 'none';
    listen();
  },
}

const stacker = {
  push: function(name) {
    if( !name ) { console.warn("No name provided"); return render(); }
    stack.unshift({start: +new Date, name: name, fontSize: window.getComputedStyle(input)['font-size']});
    storer.saveStack(stack);
    render();
  },

  pop: function() {
    stack.shift();
    storer.saveStack(stack);
    render();
  },
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
}

const tasker = {
  explode: function(cb) {
    now.innerHTML = now.innerText.replace(/([\S])/g, "<span>$1</span>")
    now.querySelectorAll('span').forEach(function(s, i) {
      window.getComputedStyle(s).opacity; // https://timtaubert.de/blog/2012/09/css-transitions-for-dynamically-created-dom-elements/
      var newTop = Math.floor(Math.random()*500)*((i%2)?1:-1);
      var newLeft = Math.floor(Math.random()*500)*((i%2)?1:-1);
      s.style.position = 'relative';
      s.style.opacity = 0;
      s.style.top = `${newTop}px`;
      s.style.left = `${newLeft}px`;
    })

    setTimeout(cb, 1000);
  }
}

const timer = {
  start: function() {
    setInterval(function() {
      if( !stack.length ) { return; }
      let diff = (+new Date - stack[0].start)/1000;

      const hours   = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = Math.floor(diff % 60);

      if( hours ) {
        timeDisplay.innerHTML = `${hours}h ${minutes}m ${seconds}s`;
      } else if( minutes ) {
        timeDisplay.innerHTML = `${minutes}m ${seconds}s`;
      } else {
        timeDisplay.innerHTML = `${seconds}s`;
      }
    }, 1000);
  }
}

reader.listen();
sawduster.listen();
timer.start();
storer.retrieveStack(function(err, savedStack) {
  if( err ) { return console.warn(err); }
  if( savedStack ) { stack = savedStack; }
  render();
})
