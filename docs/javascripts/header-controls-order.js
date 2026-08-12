// Keep theme palette in the header (instant nav replaces the drawer container).
// On mobile, a drawer button clicks the header toggle instead of relocating the form.
(function () {
  'use strict';

  var MOBILE_MQ = '(max-width: 40em)';

  function syncPaletteIcon(form) {
    if (!form) {
      form = document.querySelector('[data-md-component="palette"]');
    }
    if (!form) return;

    // Compact theme button owns the visible UI — keep Material labels hidden.
    if (form.querySelector('.dz2-theme-btn') || form.querySelector('.dz2-mode-switch')) {
      var allLabels = form.querySelectorAll('label.md-header__button');
      for (var k = 0; k < allLabels.length; k++) {
        allLabels[k].setAttribute('hidden', '');
      }
      return;
    }

    var inputs = form.querySelectorAll('.md-option');
    if (!inputs.length) return;

    var checked = form.querySelector('.md-option:checked');
    if (!checked) {
      var scheme = document.body.getAttribute('data-md-color-scheme') || 'slate';
      for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].getAttribute('data-md-color-scheme') === scheme) {
          checked = inputs[i];
          inputs[i].checked = true;
          break;
        }
      }
      if (!checked) {
        checked = inputs[0];
        checked.checked = true;
      }
    }

    for (var j = 0; j < inputs.length; j++) {
      var input = inputs[j];
      var label = input.nextElementSibling;
      while (label && label.tagName !== 'LABEL') {
        label = label.nextElementSibling;
      }
      if (!label) continue;
      var shouldHide = input !== checked;
      var isHidden = label.hasAttribute('hidden');
      if (shouldHide && !isHidden) {
        label.setAttribute('hidden', '');
      } else if (!shouldHide && isHidden) {
        label.removeAttribute('hidden');
      }
    }
  }

  function placePalette() {
    var palette = document.querySelector('[data-md-component="palette"]');
    var header = document.querySelector('.md-header__inner');
    if (!palette || !header) return;
    // Always keep the form in the header so instant navigation cannot destroy it.
    if (palette.parentElement !== header || header.lastElementChild !== palette) {
      header.appendChild(palette);
    }
  }

  function syncDrawerThemeBtn() {
    var drawerBtn = document.getElementById('drawer-theme-btn');
    var real = document.querySelector('.dz2-theme-btn');
    if (!drawerBtn || !real) return;
    drawerBtn.setAttribute('aria-label', real.getAttribute('aria-label') || 'Toggle theme');
    drawerBtn.setAttribute('data-next-mode', real.getAttribute('data-next-mode') || '');
    var icon = real.querySelector('svg');
    if (icon) {
      drawerBtn.innerHTML = icon.outerHTML;
    }
  }

  function refresh() {
    placePalette();
    syncPaletteIcon();
    syncDrawerThemeBtn();
  }

  function boot() {
    refresh();
    var form = document.querySelector('[data-md-component="palette"]');
    if (form && !form.dataset.paletteSyncBound) {
      form.dataset.paletteSyncBound = '1';
      form.addEventListener('change', function () {
        syncPaletteIcon(form);
        syncDrawerThemeBtn();
      });
    }

    if (!window.__dzPaletteMqBound) {
      window.__dzPaletteMqBound = true;
      window.matchMedia(MOBILE_MQ).addEventListener('change', refresh);

      // Opening search from the drawer should close the drawer first
      document.addEventListener('click', function (event) {
        var trigger = event.target.closest && event.target.closest('label[for="__search"]');
        if (!trigger || !trigger.closest('.mobile-drawer-controls')) return;
        var drawer = document.getElementById('__drawer');
        if (drawer) drawer.checked = false;
      });

      // Drawer theme control proxies the header toggle (form stays in header).
      document.addEventListener('click', function (event) {
        var drawerBtn = event.target.closest && event.target.closest('#drawer-theme-btn');
        if (!drawerBtn) return;
        event.preventDefault();
        var real = document.querySelector('.dz2-theme-btn');
        if (real) real.click();
      });
    }

    var header = document.querySelector('.md-header');
    if (header && !header.dataset.paletteOrderBound) {
      header.dataset.paletteOrderBound = '1';
      new MutationObserver(function () {
        refresh();
      }).observe(header, { childList: true, subtree: true });
    }

    if (!window.__dzBodyThemeObsBound) {
      window.__dzBodyThemeObsBound = true;
      new MutationObserver(syncDrawerThemeBtn).observe(document.body, {
        attributes: true,
        attributeFilter: ['data-md-color-scheme', 'data-md-color-primary']
      });
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

  onReady(boot);
})();
