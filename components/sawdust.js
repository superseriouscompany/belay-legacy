const $sawdust = document.querySelector('.js-sawdust');

let store;

module.exports = function(s) {
  store = s;
  store.subscribe(render);
}

function render() {
  const state = store.getState();

  if( !state.sawdust ) {
    return $sawdust.style.display = 'none';
  }

  const val = $sawdust.value;
  $sawdust.value = '';
  $sawdust.value = val;
  $sawdust.style.display = 'block';
  $sawdust.focus();
}
