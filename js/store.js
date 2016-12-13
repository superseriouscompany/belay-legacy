const redux = require('redux');

function stacker(state, action) {
  console.debug('Dispatched', state, action);
  state = state || {stack: []};
  switch (action.type) {
    case 'push':
      if( !action.task ) { console.warn("No task provided to push", action); return state;}
      state.stack.unshift(action.task);
      state.focus = 'hopper';
      return state;
    case 'pop':
      state.stack.shift();
      return state;
    case 'loadStack':
      state.stack = action.stack;
      return state;
    case 'focus':
      state.focus = action.place;
      return state;
    case '@@redux/INIT':
      return state;
    default:
      console.warn("Unknown action type", action.type);
      return state;
  }
}

module.exports = redux.createStore(stacker);
