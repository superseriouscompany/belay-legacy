const $now      = document.querySelector('.js-now');
const $foothold = document.querySelector('.js-foothold');

let store;

module.exports = function(s) {
  store = s;
  store.subscribe(render);

  return {
    explode: function(cb) {
      $now.innerHTML = $now.innerText.replace(/([\S])/g, "<span>$1</span>")
      const spans = $now.querySelectorAll('span');
      for( var i = 0; i < spans.length; i++ ) {
        const s = spans[i];
        window.getComputedStyle(s).opacity; // https://timtaubert.de/blog/2012/09/css-transitions-for-dynamically-created-dom-elements/
        var newTop = Math.floor(Math.random()*500)*((i%2)?1:-1);
        var newLeft = Math.floor(Math.random()*500)*((i%2)?1:-1);
        s.style.position = 'relative';
        s.style.opacity = 0;
        s.style.top = `${newTop}px`;
        s.style.left = `${newLeft}px`;
      }

      setTimeout(cb, 1000);
    }
  }
}

function render() {
  const state = store.getState();
  const stack = state.stack;

  if( state.reading ) {
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
