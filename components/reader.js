const $input          = document.querySelector('.js-next');
const defaultFontSize = parseInt(window.getComputedStyle($input)['font-size']);

let store;

module.exports = function(s) {
  store = s;
  store.subscribe(render);
  listen();
}

function render() {
  const state = store.getState();

  if( !state.reading ) {
    return $input.style.display = 'none';
  }

  $input.style.display = 'block';
  $input.focus();
}

function listen() {
  $input.addEventListener('keypress', function(event) {
    if( event.which != 13 ) { return; } // ENTER
    const task = {start: +new Date, name: $input.value, fontSize: window.getComputedStyle($input)['font-size']}
    $input.value = '';
    store.dispatch({type: 'stopReading'});
    store.dispatch({type: 'push', task: task});
    event.preventDefault();
    return false;
  })

  $input.addEventListener('keydown', function(event) {
    if( event.which != 27 ) { return; } // ESC
    $input.value = '';
  })

  $input.addEventListener('change', resize);
  $input.addEventListener('cut', ()     => setTimeout(resize));
  $input.addEventListener('paste', ()   => setTimeout(resize));
  $input.addEventListener('drop', ()    => setTimeout(resize));
  $input.addEventListener('keydown', () => setTimeout(resize));
}

function resize() {
  $input.style.height = 'auto';
  $input.style.height = $input.scrollHeight + 'px';
  // The textarea wants to be two lines when it should only be one
  if( $input.scrollHeight == 168 ) {
    $input.style.height = '84px';
  }

  // These values are arbitrary and can and should be tweaked
  if( $input.scrollHeight > document.body.clientHeight * .75 ) {
    const fontSize = parseInt(window.getComputedStyle($input)['font-size']) * .9;
    $input.style.fontSize = `${fontSize}px`;
  }
  if( $input.scrollHeight < document.body.clientHeight * .5 ) {
    const fontSize = Math.min(defaultFontSize, parseInt(window.getComputedStyle($input)['font-size']) * 1.5);
    $input.style.fontSize = `${fontSize}px`;
  }
}
