const redux  = require('redux');
const storer = require('./storer'); // this feels gross

function stacker(state, action) {
  console.debug('Dispatched', state, action);
  state = state || {stack: []};
  switch (action.type) {
    case 'push':
      if( !action.task ) { console.warn("No task provided to push", action); return state;}
      state.stack.unshift(action.task);
      storer.saveStack(state.stack);
      return state;
    case 'pop':
      state.stack.shift();
      storer.saveStack(state.stack);
      return state;
    case 'loadStack':
      state.stack = action.stack;
      return state;
    case 'startReading':
      state.reading = true;
      return state;
    case 'stopReading':
      state.reading = false;
      return state;
    case 'showMap':
      state.map = true;
      return state;
    case 'hideMap':
      state.map = false;
      return state;
    case 'showSawdust':
      state.sawdust = true;
      return state;
    case 'hideSawdust':
      state.sawdust = false;
      return state;
    case '@@redux/INIT':
      return state;
    default:
      console.warn("Unknown action type", action.type);
      return state;
  }
}

module.exports = redux.createStore(stacker);
