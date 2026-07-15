// Filter search results to the language currently selected in the site.
//
// mkdocs-static-i18n builds a single, global search index that contains the
// entries for every locale (en, zh, ja, ko, pt, es, fr, it). Material's search
// therefore returns matches in all languages regardless of the page you are on.
// This script hides the result items whose target URL does not belong to the
// current locale so the search respects the selected language.
(function() {
  'use strict';

  var LOCALE_SEGMENTS = ['zh', 'ja', 'ko', 'pt', 'es', 'fr', 'it'];

  function localeOfPath(pathname) {
    var first = (pathname || '').split('/').filter(Boolean)[0];
    return LOCALE_SEGMENTS.indexOf(first) !== -1 ? first : 'en';
  }

  var currentLocale = localeOfPath(window.location.pathname);

  function localeOfHref(href) {
    if (!href) return 'en';
    try {
      return localeOfPath(new URL(href, window.location.href).pathname);
    } catch (e) {
      return 'en';
    }
  }

  function updateMeta(resultRoot, visibleCount) {
    var meta = resultRoot.querySelector('.md-search-result__meta');
    if (!meta) return;
    // Replace the first number in the (possibly translated) meta string with
    // the count of results actually shown for the current language.
    var text = meta.textContent || '';
    if (/\d+/.test(text)) {
      meta.textContent = text.replace(/\d+/, String(visibleCount));
    }
  }

  function filterResults(resultRoot) {
    var list = resultRoot.querySelector('.md-search-result__list');
    if (!list) return;
    var items = list.querySelectorAll('.md-search-result__item');
    var visible = 0;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var link = item.querySelector('a.md-search-result__link');
      // Use the resolved .href so the URL is absolute regardless of whether
      // Material emitted a root- or page-relative attribute.
      var keep = !!link && localeOfHref(link.href) === currentLocale;
      item.hidden = !keep;
      item.style.display = keep ? '' : 'none';
      if (keep) visible++;
    }
    updateMeta(resultRoot, visible);
  }

  function init() {
    var resultRoot = document.querySelector('[data-md-component="search-result"]');
    if (!resultRoot) return;

    var scheduled = false;
    var observer = new MutationObserver(function() {
      // Debounce: Material repopulates the list on every keystroke and appends
      // results in batches. Coalesce bursts into a single filtering pass.
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(function() {
        scheduled = false;
        filterResults(resultRoot);
      });
    });
    observer.observe(resultRoot, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
