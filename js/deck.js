// Marp decks. Each [data-deck] wraps one .deck of slides and its controls.
//
// Present mode shows one slide at a time, filling the window, and goes full
// screen where the browser allows it. Arrow keys, space, Page Up/Down, Home
// and End move between slides, clicking advances, and Escape leaves.
//
// An inline viewer ({% marpDeck %}) is a row of slides that scrolls and swipes
// on its own. This adds previous and next buttons, a counter, and the arrow
// keys while the viewer has focus, and starts present mode at the slide shown.
(function () {
  var active = null;

  document.querySelectorAll('[data-deck]').forEach(function (root) {
    var deck = root.querySelector('.deck');
    var slides = deck ? deck.querySelectorAll('svg[data-marpit-svg]') : [];
    if (!slides.length) return;

    var track = deck.querySelector('.marpit');
    var inline = deck.classList.contains('deck-inline');
    var present = root.querySelector('.deck-present');
    var prev = root.querySelector('.deck-prev');
    var next = root.querySelector('.deck-next');
    var count = root.querySelector('.deck-count');
    var current = 0;

    function presenting() {
      return deck.classList.contains('is-presenting');
    }

    function show(index) {
      current = Math.max(0, Math.min(slides.length - 1, index));
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-current', i === current);
      });
      if (inline && !presenting()) {
        track.scrollTo({ left: current * track.clientWidth, behavior: 'smooth' });
      }
      update();
    }

    function update() {
      if (count) count.textContent = (current + 1) + ' / ' + slides.length;
      if (prev) prev.disabled = current === 0;
      if (next) next.disabled = current === slides.length - 1;
    }

    function start() {
      active = { root: root, show: show, stop: stop, current: function () { return current; }, count: slides.length };
      deck.classList.add('is-presenting');
      show(current);
      deck.focus();
      if (deck.requestFullscreen) deck.requestFullscreen().catch(function () {});
    }

    function stop() {
      deck.classList.remove('is-presenting');
      active = null;
      if (document.fullscreenElement) document.exitFullscreen();
      // Back in the row, land on the slide the presenter stopped at
      if (inline) track.scrollLeft = current * track.clientWidth;
    }

    if (present) {
      present.hidden = false;
      present.addEventListener('click', start);
    }

    if (inline) {
      [prev, next].forEach(function (button) {
        if (button) button.hidden = false;
      });
      if (prev) prev.addEventListener('click', function () { show(current - 1); });
      if (next) next.addEventListener('click', function () { show(current + 1); });

      // Keep the counter in step with swipes and trackpad scrolling
      var settle;
      track.addEventListener('scroll', function () {
        if (presenting()) return;
        clearTimeout(settle);
        settle = setTimeout(function () {
          current = Math.round(track.scrollLeft / track.clientWidth);
          update();
        }, 80);
      });

      deck.addEventListener('keydown', function (event) {
        if (presenting()) return;
        if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
      });

      update();
    }

    // Escape in full screen exits full screen without a keydown reaching us
    document.addEventListener('fullscreenchange', function () {
      if (!document.fullscreenElement && presenting()) stop();
    });

    deck.addEventListener('click', function () {
      if (presenting()) show(current + 1);
    });
  });

  document.addEventListener('keydown', function (event) {
    if (!active) return;
    var current = active.current();
    var moves = {
      ArrowRight: current + 1, ArrowDown: current + 1, PageDown: current + 1, ' ': current + 1,
      ArrowLeft: current - 1, ArrowUp: current - 1, PageUp: current - 1,
      Home: 0, End: active.count - 1
    };
    if (event.key === 'Escape') {
      active.stop();
    } else if (event.key in moves) {
      event.preventDefault();
      active.show(moves[event.key]);
    }
  });
})();
