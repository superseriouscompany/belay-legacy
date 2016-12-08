const redux = require('redux');

function stacker(state, action) {
  console.debug('Dispatched', state, action);
  state = state || [];
  switch (action.type) {
    case 'push':
      if( !action.task ) { console.warn("No task provided to push", action); return state;}
      state.unshift(action.task);
      return state;
    case 'pop':
      state.shift();
      return state;
    case 'loadStack':
      state = action.stack;
      return state;
    case '@@redux/INIT':
      return state;
    default:
      console.warn("Unknown action type", action.type);
      return state;
  }
}

module.exports = redux.createStore(stacker);
