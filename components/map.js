const $map  = document.querySelector('.js-map');
const timer = require('../js/timer.js');

let store;

module.exports = function(s) {
  store = s;
  store.subscribe(render);
}

function render() {
  const state = store.getState();

  if( !state.map ) {
    return $map.style.display = 'none';
  }

  $map.style.display = 'block';
  $map.innerHTML = renderStack(state.stack);
}

function renderStack(stack) {
  return [].concat(stack).reverse().map(function(t, i) {
    let indentation = '';
    for( var j = 0; j < i; j++ ) { indentation += "--"}

    return `${indentation}${t.name} ${timer.renderTime(t.start).split(' ').slice(0,2).join(' ')}`
  }).join("<br />");
}
