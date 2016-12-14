const $foothold = document.querySelector('.js-foothold');

let store;

module.exports = function(s) {
  store = s;
  store.subscribe(render);
}

function render() {
  const state = store.getState();
  const task = state.reading ? state.stack[0] : state.stack[1];
  $foothold.innerHTML = task && task.name || "";
}
