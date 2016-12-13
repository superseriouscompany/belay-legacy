const $now      = document.querySelector('.js-now');
const $foothold = document.querySelector('.js-foothold');

let store;

module.exports = function(s) {
  store = s;
  store.subscribe(render);
}

function render() {
  const state = store.getState();
  const stack = state.stack;

  if( state.focus == 'reader' ) {
    return $now.style.display = 'none';
  }

  $now.style.display   = 'block';
  if( stack.length ) {
    $now.innerHTML = stack[0].name;
    if( stack[0].fontSize ) {
      $now.style.fontSize = stack[0].fontSize;
    }
    $foothold.innerHTML = stack[1] && stack[1].name || "";
  } else {
    $now.innerHTML = 'Do one thing.'
  }
}
