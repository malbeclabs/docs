// Keep theme toggle rightmost on desktop; on mobile move it into the drawer.
// Also ensure only one palette icon is visible.
(function () {
  'use strict';

  var busy = false;
  var MOBILE_MQ = '(max-width: 40em)';

  function syncPaletteIcon(form) {
    if (!form) {
      form = document.querySelector('[data-md-component="palette"]');
    }
    if (!form) return;

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
    if (!palette) return;

    var drawerSlot = document.getElementById('drawer-palette-slot');
    var header = document.querySelector('.md-header__inner');
    var mobile = window.matchMedia(MOBILE_MQ).matches;

    if (mobile && drawerSlot) {
      if (palette.parentElement !== drawerSlot) {
        drawerSlot.appendChild(palette);
      }
    } else if (header) {
      if (palette.parentElement !== header || header.lastElementChild !== palette) {
        header.appendChild(palette);
      }
    }
  }

  function refresh() {
    if (busy) return;
    busy = true;
    try {
      placePalette();
      syncPaletteIcon();
    } finally {
      busy = false;
    }
  }

  function boot() {
    refresh();
    var form = document.querySelector('[data-md-component="palette"]');
    if (form) {
      form.addEventListener('change', function () {
        syncPaletteIcon(form);
      });
    }

    window.matchMedia(MOBILE_MQ).addEventListener('change', refresh);

    // Opening search from the drawer should close the drawer first
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest && event.target.closest('label[for="__search"]');
      if (!trigger || !trigger.closest('.mobile-drawer-controls')) return;
      var drawer = document.getElementById('__drawer');
      if (drawer) drawer.checked = false;
    });

    var header = document.querySelector('.md-header');
    if (!header || header.dataset.paletteOrderBound) return;
    header.dataset.paletteOrderBound = '1';
    new MutationObserver(function () {
      refresh();
    }).observe(header, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
