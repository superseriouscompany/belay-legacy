const $sawdust = document.querySelector('.js-sawdust');
const storer   = require('../js/storer');

let store;

module.exports = function(s) {
  store = s;
  store.subscribe(render);

  storer.retrieveSawdust(function(err, savedSawdust) {
    if( err ) { return console.warn(err); }
    if( savedSawdust ) { $sawdust.value = savedSawdust; }
  })
}

function render() {
  const state = store.getState();

  if( !state.sawdust ) {
    // TODO: this feels gross
    if( $sawdust.style.display == 'block' ) {
      $sawdust.value = $sawdust.value.trim();
      if( $sawdust.value && $sawdust.value[$sawdust.value.length-1] != "\n" ) {
        $sawdust.value += "\n";
      }
      storer.saveSawdust($sawdust.value, function(err) {
        if( err ) { return console.error(err); }
      })
    }
    return $sawdust.style.display = 'none';
  }

  const val = $sawdust.value;
  $sawdust.value = '';
  $sawdust.value = val;
  $sawdust.style.display = 'block';
  $sawdust.focus();
}
