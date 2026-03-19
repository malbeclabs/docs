// Display the currently selected language name next to the language selector icon
(function() {
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

  function getCurrentLanguageName() {
    var locale = getCurrentLocale();
    var selector = document.querySelector('.md-select .md-select__list');
    if (!selector) return null;
    var links = selector.querySelectorAll('.md-select__link');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var hreflang = link.getAttribute('hreflang') || '';
      if (hreflang === locale) {
        return link.textContent.trim();
      }
    }
    return null;
  }

  function init() {
    // Find the language selector button via its parent .md-select container
    // rather than aria-label, which gets translated on non-English pages
    var selector = document.querySelector('.md-select');
    if (!selector) return;
    var btn = selector.querySelector('button');
    if (!btn) return;
    var name = getCurrentLanguageName();
    if (!name) return;
    var label = document.createElement('span');
    label.className = 'md-header__language-label';
    label.textContent = name;
    btn.appendChild(label);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
