// "On this page" TOC title → scroll to top of the current page
(function () {
  'use strict';

  function scrollToPageTop(event) {
    var link = event.target.closest('.toc-page-top');
    if (!link) return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (history.replaceState) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  document.addEventListener('click', scrollToPageTop);
})();
