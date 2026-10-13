// "Draw a card": jumps to a random law.
document.querySelectorAll('.law-draw:not([data-ready])').forEach(function (button) {
  var urls = JSON.parse(button.dataset.urls);
  button.dataset.ready = 'true';
  button.hidden = false;
  button.addEventListener('click', function () {
    var others = urls.filter(function (url) { return url !== location.pathname; });
    location.href = others[Math.floor(Math.random() * others.length)];
  });
});
