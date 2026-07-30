// Keep theme toggle rightmost, and ensure only one palette icon is visible
(function () {
  'use strict';

  var busy = false;

  function syncPaletteIcon() {
    var form = document.querySelector(
      '.md-header__option[data-md-component="palette"]'
    );
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

  function movePaletteRight() {
    var header = document.querySelector('.md-header__inner');
    var palette = document.querySelector(
      '.md-header__inner > .md-header__option[data-md-component="palette"]'
    );
    if (!header || !palette) return;
    if (header.lastElementChild === palette) return;
    header.appendChild(palette);
  }

  function refresh() {
    if (busy) return;
    busy = true;
    try {
      movePaletteRight();
      syncPaletteIcon();
    } finally {
      busy = false;
    }
  }

  function boot() {
    refresh();
    var form = document.querySelector(
      '.md-header__option[data-md-component="palette"]'
    );
    if (form) {
      form.addEventListener('change', syncPaletteIcon);
    }

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
