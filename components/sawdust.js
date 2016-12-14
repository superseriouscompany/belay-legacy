const $sawdust = document.querySelector('.js-sawdust');

let store;

module.exports = function(s) {
  store = s;
  store.subscribe(render);
}

function render() {
  const state = store.getState();

  if( !state.sawdust ) {
    if( $sawdust.style.display == 'block' ) {
      $sawdust.value = $sawdust.value.trim();
      if( $sawdust.value && $sawdust.value[$sawdust.value.length-1] != "\n" ) {
        $sawdust.value += "\n";
      }
    }
    return $sawdust.style.display = 'none';
  }

  const val = $sawdust.value;
  $sawdust.value = '';
  $sawdust.value = val;
  $sawdust.style.display = 'block';
  $sawdust.focus();
}
