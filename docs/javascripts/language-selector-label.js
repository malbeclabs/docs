// Language control: label + path-aware alternate links for navigation.instant.
//
// mkdocs-static-i18n warns that Material's contextual language hrefs go stale
// under instant navigation. We rewrite every alternate link from the current
// pathname so locale switches always target the page you are on.
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

  function stripLocale(pathname) {
    var segments = (pathname || '/').split('/').filter(Boolean);
    if (segments.length && LOCALE_SEGMENTS.indexOf(segments[0]) !== -1) {
      segments.shift();
    }
    return segments;
  }

  // Build a same-page URL in targetLocale (en has no prefix).
  // Preserve query + hash so deep links like /architecture/#topology survive.
  function localizePath(pathname, targetLocale) {
    var segments = stripLocale(pathname);
    var tail = segments.length ? segments.join('/') + '/' : '';
    var base;
    if (!targetLocale || targetLocale === 'en') {
      base = '/' + tail;
    } else {
      base = '/' + targetLocale + '/' + tail;
    }
    return base + window.location.search + window.location.hash;
  }

  function markActive(links, locale) {
    var activeName = null;
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var hreflang = link.getAttribute('hreflang') || '';
      link.setAttribute('href', localizePath(window.location.pathname, hreflang));
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

  function bindLocaleClicks(root) {
    if (!root || root.dataset.langNavBound === '1') return;
    root.dataset.langNavBound = '1';
    root.addEventListener('click', function (event) {
      var link = event.target.closest && event.target.closest('a[hreflang]');
      if (!link || !root.contains(link)) return;
      var hreflang = link.getAttribute('hreflang') || 'en';
      // Full navigation on locale change (search index / chrome differ per language).
      event.preventDefault();
      window.location.assign(localizePath(window.location.pathname, hreflang));
    });
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
      bindLocaleClicks(selector);
    }

    var drawerLang = document.querySelector('.mobile-drawer-lang');
    if (drawerLang) {
      var drawerLabel = drawerLang.querySelector('.mobile-drawer-lang__label');
      var drawerActive = markActive(drawerLang.querySelectorAll('.mobile-drawer-lang__list a'), locale);
      if (drawerLabel && drawerActive) {
        drawerLabel.textContent = drawerActive;
      }
      bindLocaleClicks(drawerLang);
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
