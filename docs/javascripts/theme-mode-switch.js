// DoubleZero CompactThemeToggle (doublezero.xyz) — single button, not a switch.
(function () {
  'use strict';

  var LIGHT_SCHEME = 'default';
  var DARK_SCHEME = 'slate';

  // Glyph for the mode you will switch TO (matches marketing CompactThemeToggle).
  var ICON_LIGHT =
    '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M8.75 2V1.25H7.25V3H8.75V2ZM8 10C8.53043 10 9.03914 9.78929 9.41421 9.41421C9.78929 9.03914 10 8.53043 10 8C10 7.46957 9.78929 6.96086 9.41421 6.58579C9.03914 6.21071 8.53043 6 8 6C7.46957 6 6.96086 6.21071 6.58579 6.58579C6.21071 6.96086 6 7.46957 6 8C6 8.53043 6.21071 9.03914 6.58579 9.41421C6.96086 9.78929 7.46957 10 8 10ZM8 11.5C8.92826 11.5 9.8185 11.1313 10.4749 10.4749C11.1313 9.8185 11.5 8.92826 11.5 8C11.5 7.07174 11.1313 6.1815 10.4749 5.52513C9.8185 4.86875 8.92826 4.5 8 4.5C7.07174 4.5 6.1815 4.86875 5.52513 5.52513C4.86875 6.1815 4.5 7.07174 4.5 8C4.5 8.92826 4.86875 9.8185 5.52513 10.4749C6.1815 11.1313 7.07174 11.5 8 11.5ZM8.75 13V14.75H7.25V13H8.75ZM13 7.25H14.75V8.75H13V7.25ZM2 7.25H1.25V8.75H3V7.25H2ZM11 3.93L11.54 3.4L11.71 3.23L12.24 2.7L13.3 3.76L12.77 4.29L12.6 4.46L12.07 4.99L11 3.93ZM3.23 11.71L2.7 12.24L3.76 13.3L4.29 12.77L4.46 12.6L4.99 12.07L3.93 11L3.4 11.53L3.23 11.71ZM3.93 5L3.4 4.47L3.23 4.3L2.7 3.77L3.76 2.7L4.29 3.23L4.46 3.4L4.99 3.93L3.93 5ZM11.71 12.78L12.24 13.31L13.3 12.25L12.77 11.72L12.6 11.55L12.07 11.02L11 12.07L11.53 12.6L11.71 12.78Z" fill="currentColor"/>' +
    '</svg>';

  var ICON_DARK =
    '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M6.3 3.3L7 3.55C6.72222 4.31065 6.66754 5.13483 6.84238 5.92551C7.01723 6.71619 7.41432 7.44047 7.98693 8.01307C8.55953 8.58567 9.28381 8.98277 10.0745 9.15762C10.8652 9.33246 11.6893 9.27778 12.45 9L13.41 9.96L13.33 10.16C12.9709 11.0489 12.3952 11.8339 11.6554 12.4436C10.9155 13.0533 10.035 13.4683 9.09381 13.6509C8.15266 13.8335 7.1808 13.7778 6.26663 13.4891C5.35246 13.2003 4.52501 12.6875 3.85954 11.9974C3.19408 11.3073 2.71173 10.4617 2.45637 9.53768C2.20101 8.61362 2.18076 7.64038 2.39745 6.70649C2.61413 5.77261 3.06089 4.90772 3.69706 4.19052C4.33323 3.47332 5.13864 2.92656 6.04 2.6L6.3 3.3ZM5.25 4.76C4.84332 5.15097 4.51875 5.61916 4.2953 6.13715C4.07185 6.65513 3.95402 7.21251 3.9487 7.77661C3.94338 8.34071 4.05068 8.90021 4.26432 9.42232C4.47796 9.94443 4.79364 10.4187 5.19288 10.8172C5.59211 11.2158 6.06686 11.5307 6.58933 11.7435C7.1118 11.9562 7.67147 12.0626 8.23556 12.0563C8.79966 12.0501 9.35683 11.9313 9.87445 11.707C10.3921 11.4827 10.8597 11.1573 11.25 10.75H11C10.2234 10.7507 9.45469 10.5941 8.74025 10.2897C8.02582 9.9852 7.38047 9.53916 6.84313 8.97846C6.30579 8.41776 5.8876 7.75402 5.6138 7.02728C5.33999 6.30054 5.21623 5.52587 5.25 4.75M12.5 3.5H13.75V5H12.5V6.25H11V5H9.75V3.5H11V2.25H12.5V3.5ZM7 3.55L6.3 3.3L6.04 2.6L7 3.55Z" fill="currentColor"/>' +
    '</svg>';

  function currentScheme() {
    return document.body.getAttribute('data-md-color-scheme') || DARK_SCHEME;
  }

  function nextMode() {
    return currentScheme() === LIGHT_SCHEME ? 'dark' : 'light';
  }

  function findPaletteInput(scheme) {
    var form = document.querySelector('[data-md-component="palette"]');
    if (!form) return null;
    var inputs = form.querySelectorAll('input[data-md-color-scheme]');
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].getAttribute('data-md-color-scheme') === scheme) {
        return inputs[i];
      }
    }
    return null;
  }

  function applyScheme(scheme) {
    var input = findPaletteInput(scheme);
    if (!input || input.checked) {
      syncButton();
      return;
    }
    var label = document.querySelector('label[for="' + input.id + '"]');
    if (label) {
      label.click();
    } else {
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    syncButton();
  }

  function cycleTheme() {
    applyScheme(nextMode() === 'light' ? LIGHT_SCHEME : DARK_SCHEME);
  }

  function syncButton() {
    var btn = document.querySelector('.dz2-theme-btn');
    if (!btn) return;
    var mode = nextMode();
    var label = mode === 'dark' ? 'Switch to dark mode' : 'Switch to light mode';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('data-next-mode', mode);
    btn.innerHTML =
      (mode === 'dark' ? ICON_DARK : ICON_LIGHT) +
      '<span class="dz2-theme-btn__tip" role="tooltip">' +
      '<span class="dz2-theme-btn__tip-text">' +
      label +
      '</span>' +
      '<span class="dz2-theme-btn__kbd"><kbd>Ctrl</kbd><span>+</span><kbd>Shift</kbd><span>+</span><kbd>L</kbd></span>' +
      '</span>';
  }

  function buildButton() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dz2-theme-btn';
    btn.addEventListener('click', cycleTheme);
    return btn;
  }

  function hideMaterialLabels(form) {
    if (!form) return;
    form.classList.add('dz2-palette-host');
    var labels = form.querySelectorAll('label.md-header__button');
    for (var i = 0; i < labels.length; i++) {
      labels[i].setAttribute('hidden', '');
      labels[i].setAttribute('aria-hidden', 'true');
    }
  }

  function mount() {
    var form = document.querySelector('[data-md-component="palette"]');
    if (!form) return;

    hideMaterialLabels(form);

    // Remove accidental ModeSwitch if a previous load left it around
    var oldSwitch = form.querySelector('.dz2-mode-switch');
    if (oldSwitch) oldSwitch.remove();

    var existing = form.querySelector('.dz2-theme-btn');
    if (!existing) {
      form.appendChild(buildButton());
    }
    syncButton();
  }

  function boot() {
    mount();

    var form = document.querySelector('[data-md-component="palette"]');
    if (form) {
      form.addEventListener('change', syncButton);
    }

    new MutationObserver(syncButton).observe(document.body, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme', 'data-md-color-primary']
    });

    document.addEventListener('keydown', function (event) {
      if (!(event.ctrlKey || event.metaKey) || !event.shiftKey) return;
      if (event.key !== 'l' && event.key !== 'L') return;
      var tag = (event.target && event.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (event.target && event.target.isContentEditable)) {
        return;
      }
      event.preventDefault();
      cycleTheme();
    });

    if (typeof document$ !== 'undefined' && document$.subscribe) {
      document$.subscribe(mount);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
