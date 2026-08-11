// Show current language name + chevron on the header language control
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

  function markActive(links, locale) {
    var activeName = null;
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var hreflang = link.getAttribute('hreflang') || '';
      if (hreflang === locale) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
        activeName = link.textContent.trim();
      } else {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      }
    }
    return activeName;
  }

  function init() {
    var locale = getCurrentLocale();

    var selector = document.querySelector('.md-header .md-select');
    if (selector) {
      var btn = selector.querySelector('button');
      var label = selector.querySelector('.md-header__language-label');
      var activeName = markActive(selector.querySelectorAll('.md-select__link'), locale);

      if (label && activeName) {
        label.textContent = activeName;
      }
      if (btn && activeName) {
        btn.setAttribute('title', activeName);
        btn.setAttribute('aria-label', 'Language: ' + activeName);
      }
    }

    var drawerLang = document.querySelector('.mobile-drawer-lang');
    if (drawerLang) {
      var drawerLabel = drawerLang.querySelector('.mobile-drawer-lang__label');
      var drawerActive = markActive(drawerLang.querySelectorAll('.mobile-drawer-lang__list a'), locale);
      if (drawerLabel && drawerActive) {
        drawerLabel.textContent = drawerActive;
      }
    }
  }

  function onReady(fn) {
    if (typeof document$ !== 'undefined' && document$.subscribe) {
      document$.subscribe(fn);
      return;
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(init);
})();
