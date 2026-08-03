// Paired Solana journeys: toggle between short runbook and full setup guide.
// Runbooks live at <guide-path>/runbook/ (same title, sibling URL).
(function() {
  'use strict';

  var GUIDES_WITH_RUNBOOK = {
    'DZ Mainnet-beta Connection': 1,
    'DZ Testnet Connection': 1,
    'Validator Multicast Connection': 1,
    'Edge Subscriber Connection': 1,
    'Permissioned Connection': 1,
    'Other Multicast Connection': 1,
    'Validator Rewards': 1,
    'setup': 1,
    'troubleshooting': 1
  };

  var LOCALES = { zh: 1, ja: 1, ko: 1, pt: 1, es: 1, fr: 1, it: 1 };

  function pathParts() {
    var parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length && LOCALES[parts[0]]) parts = parts.slice(1);
    return parts;
  }

  function siteRoot() {
    var parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length && LOCALES[parts[0]]) {
      return window.location.origin + '/' + parts[0] + '/';
    }
    return window.location.origin + '/';
  }

  function encodeSeg(seg) {
    return encodeURIComponent(seg);
  }

  function pageUrls(rel) {
    var page = siteRoot() + rel.replace(/^\//, '');
    if (page.slice(-1) !== '/') page += '/';
    return {
      page: page,
      markdown: page + 'index.md'
    };
  }

  function resolvePair() {
    var parts = pathParts();
    if (!parts.length) return null;

    // /<guide>/runbook/
    if (parts[parts.length - 1] === 'runbook' && parts.length >= 2) {
      var guideKey = decodeURIComponent(parts[parts.length - 2]);
      if (!GUIDES_WITH_RUNBOOK[guideKey]) return null;
      var base = encodeSeg(guideKey) + '/';
      return {
        mode: 'runbook',
        runbook: pageUrls(base + 'runbook/'),
        guide: pageUrls(base)
      };
    }

    // /<guide>/
    var key = decodeURIComponent(parts[parts.length - 1]);
    if (!GUIDES_WITH_RUNBOOK[key]) return null;
    var guideBase = encodeSeg(key) + '/';
    return {
      mode: 'guide',
      runbook: pageUrls(guideBase + 'runbook/'),
      guide: pageUrls(guideBase)
    };
  }

  function fetchMarkdown(url, callback) {
    fetch(url)
      .then(function(r) { return r.ok ? r.text() : null; })
      .then(function(md) { callback(md && md.trim() ? md : null); })
      .catch(function() { callback(null); });
  }

  function copyText(text, btn) {
    function done() {
      if (!btn) return;
      var original = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(function() {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 2000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function() {
        fallbackCopy(text); done();
      });
    } else {
      fallbackCopy(text); done();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-999999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function buildAgentPrompt(md, runbookPageUrl) {
    return 'Follow this DoubleZero onboarding runbook step by step. ' +
      'Run commands on the target host. Honor any STOP conditions. ' +
      'Source: ' + runbookPageUrl + '\n\n' + md;
  }

  function openWithPrefill(service, promptText) {
    if (service === 'claude') {
      return 'https://claude.ai/new?q=' + encodeURIComponent(promptText);
    }
    return 'https://chatgpt.com/?q=' + encodeURIComponent(promptText);
  }

  function askWithRunbook(service, mdUrl, pageUrl, btn) {
    var win = window.open('about:blank', '_blank');
    fetchMarkdown(mdUrl, function(md) {
      var prompt = md
        ? buildAgentPrompt(md, pageUrl)
        : 'Please fetch and follow this DoubleZero runbook step by step: ' + mdUrl;
      if (prompt.length > 12000) {
        prompt = prompt.substring(0, 12000) + '\n\n[Truncated — full runbook: ' + mdUrl + ']';
      }
      var target = openWithPrefill(service, prompt);
      if (win) {
        win.location = target;
      } else {
        window.open(target, '_blank');
      }
      if (btn) {
        var original = btn.textContent;
        btn.textContent = 'Opened';
        setTimeout(function() { btn.textContent = original; }, 1500);
      }
    });
  }

  function normalizePath(pathname) {
    var p = pathname || '/';
    if (p.length > 1 && p.slice(-1) === '/') p = p.slice(0, -1);
    return p;
  }

  function pathFromHref(href) {
    if (!href || href.charAt(0) === '#') return null;
    try {
      return normalizePath(new URL(href, window.location.href).pathname);
    } catch (e) {
      return null;
    }
  }

  function firstChildToggle(nestedItem) {
    var kids = nestedItem.children;
    for (var i = 0; i < kids.length; i++) {
      if (kids[i].classList && kids[i].classList.contains('md-nav__toggle')) {
        return kids[i];
      }
    }
    return null;
  }

  function closeSiblingSections(nestedItem) {
    var list = nestedItem.parentElement;
    if (!list) return;
    var children = list.children;
    for (var i = 0; i < children.length; i++) {
      var sib = children[i];
      if (sib === nestedItem) continue;
      if (!sib.classList || !sib.classList.contains('md-nav__item--nested')) continue;
      var toggle = firstChildToggle(sib);
      if (!toggle) continue;
      toggle.checked = false;
      toggle.classList.remove('md-toggle--indeterminate');
      try { toggle.indeterminate = false; } catch (e) {}
    }
  }

  // Full-setup URLs are not in the nav (only runbooks are). Keep the matching
  // Solana item active and the section expanded when toggling to Full setup.
  function syncSidebarForPair(pair) {
    var runbookPath = normalizePath(new URL(pair.runbook.page).pathname);
    var guidePath = normalizePath(new URL(pair.guide.page).pathname);
    var prefer = [runbookPath, guidePath];

    var links = document.querySelectorAll('.md-sidebar--primary a.md-nav__link');
    var matched = null;
    for (var c = 0; c < prefer.length && !matched; c++) {
      for (var i = 0; i < links.length; i++) {
        if (pathFromHref(links[i].getAttribute('href')) === prefer[c]) {
          matched = links[i];
          break;
        }
      }
    }
    if (!matched) return;

    document.querySelectorAll('.md-sidebar--primary a.md-nav__link--active').forEach(function(el) {
      el.classList.remove('md-nav__link--active');
      el.removeAttribute('aria-current');
    });
    document.querySelectorAll('.md-sidebar--primary .md-nav__item--active').forEach(function(el) {
      el.classList.remove('md-nav__item--active');
    });
    matched.classList.add('md-nav__link--active');
    matched.setAttribute('aria-current', 'page');
    var item = matched.closest('.md-nav__item');
    if (item) item.classList.add('md-nav__item--active');

    var el = matched;
    while (el && el !== document.body) {
      if (el.classList && el.classList.contains('md-nav__item--nested')) {
        var toggle = firstChildToggle(el);
        if (toggle) {
          toggle.checked = true;
          closeSiblingSections(el);
        }
      }
      el = el.parentElement;
    }
  }

  function injectToggle(pair) {
    var content = document.querySelector('.md-content__inner');
    if (!content) return;
    var h1 = content.querySelector('h1');
    if (!h1) return;
    if (content.querySelector('.guide-mode-bar')) return;

    var bar = document.createElement('div');
    bar.className = 'guide-mode-bar';

    var runbookActive = pair.mode === 'runbook';
    bar.innerHTML =
      '<div class="guide-mode-toggle" role="group" aria-label="Choose guide format">' +
        '<a class="guide-mode-option' + (runbookActive ? ' is-active' : '') + '" href="' + pair.runbook.page + '"' +
          (runbookActive ? ' aria-current="page"' : '') + '>Runbook</a>' +
        '<a class="guide-mode-option' + (!runbookActive ? ' is-active' : '') + '" href="' + pair.guide.page + '"' +
          (!runbookActive ? ' aria-current="page"' : '') + '>Full setup</a>' +
      '</div>' +
      '<div class="guide-mode-actions">' +
        '<button type="button" class="runbook-assist-btn" id="guide-copy-llm">Copy runbook for LLM</button>' +
        (runbookActive
          ? '<button type="button" class="runbook-assist-btn runbook-assist-btn-secondary" id="guide-ask-claude">Ask Claude</button>'
          : '') +
      '</div>';

    h1.insertAdjacentElement('afterend', bar);

    document.getElementById('guide-copy-llm').addEventListener('click', function() {
      var btn = this;
      fetchMarkdown(pair.runbook.markdown, function(md) {
        if (!md) {
          btn.textContent = 'Failed';
          setTimeout(function() { btn.textContent = 'Copy runbook for LLM'; }, 2000);
          return;
        }
        copyText(buildAgentPrompt(md, pair.runbook.page), btn);
      });
    });

    var askBtn = document.getElementById('guide-ask-claude');
    if (askBtn) {
      askBtn.addEventListener('click', function() {
        askWithRunbook('claude', pair.runbook.markdown, pair.runbook.page, this);
      });
    }
  }

  function init() {
    var pair = resolvePair();
    if (!pair) return;
    injectToggle(pair);
    // After Material finishes marking the active branch (full-setup pages are
    // not in nav, so it would otherwise collapse Solana).
    requestAnimationFrame(function() {
      syncSidebarForPair(pair);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
