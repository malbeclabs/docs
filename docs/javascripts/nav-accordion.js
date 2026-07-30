// Accordion primary nav: opening a nested section closes sibling sections
// at the same level (so Solana + Other tenants can't both stay expanded).
(function() {
  'use strict';

  function siblingToggles(toggle) {
    var item = toggle.closest('.md-nav__item--nested');
    if (!item) return [];
    var list = item.parentElement;
    if (!list || !list.classList.contains('md-nav__list')) return [];
    var result = [];
    var children = list.children;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (!child.classList || !child.classList.contains('md-nav__item--nested')) continue;
      var kids = child.children;
      for (var j = 0; j < kids.length; j++) {
        if (kids[j].classList && kids[j].classList.contains('md-nav__toggle') && kids[j] !== toggle) {
          result.push(kids[j]);
          break;
        }
      }
    }
    return result;
  }

  function closeSiblings(toggle) {
    siblingToggles(toggle).forEach(function(other) {
      other.checked = false;
      other.classList.remove('md-toggle--indeterminate');
      // Material uses indeterminate for "contains active page"; clear it so
      // the section visually collapses when another section is opened.
      try { other.indeterminate = false; } catch (e) {}
    });
  }

  function onToggleChange(e) {
    var toggle = e.target;
    if (!toggle || !toggle.classList || !toggle.classList.contains('md-nav__toggle')) return;
    if (!toggle.checked) return;
    closeSiblings(toggle);
  }

  function bind(root) {
    if (!root || root.getAttribute('data-nav-accordion') === '1') return;
    root.setAttribute('data-nav-accordion', '1');
    root.addEventListener('change', onToggleChange);
  }

  function init() {
    document.querySelectorAll('.md-sidebar--primary').forEach(bind);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Instant navigation / SPA-style replacements (if enabled later)
  document.addEventListener('DOMContentLoaded', function() {
    var observer = new MutationObserver(function() { init(); });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
