// Highlight the active language in the selector dropdown
(function () {
  'use strict';

  var LOCALE_SEGMENTS = ['zh', 'ja', 'ko', 'pt', 'es', 'fr', 'it'];

  function getCurrentLocale() {
    var pathname = window.location.pathname || '';
    var segments = pathname.split('/').filter(Boolean);
    var first = segments[0];
    if (LOCALE_SEGMENTS.indexOf(first) !== -1) {
      return first;
    }
    return 'en';
  }

  function init() {
    var selector = document.querySelector('.md-select');
    if (!selector) return;

    var btn = selector.querySelector('button');
    var locale = getCurrentLocale();
    var links = selector.querySelectorAll('.md-select__link');
    var activeName = null;

    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var hreflang = link.getAttribute('hreflang') || '';
      if (hreflang === locale) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'true');
        activeName = link.textContent.trim();
      } else {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      }
    }

    if (btn && activeName) {
      btn.setAttribute('title', activeName);
      btn.setAttribute('aria-label', 'Language: ' + activeName);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
