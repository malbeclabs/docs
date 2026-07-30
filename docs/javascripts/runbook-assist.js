// On long guides that have a matching runbook: show a banner with Open /
// Copy-for-LLM / Ask-Claude actions so new users can feed an agent the short path.
(function() {
  'use strict';

  // pathname segment (decoded) → runbook path under site root
  var RUNBOOK_MAP = {
    'DZ Mainnet-beta Connection': 'runbooks/solana-ibrl-mainnet/',
    'DZ Testnet Connection': 'runbooks/solana-ibrl-testnet/',
    'Validator Multicast Connection': 'runbooks/publish-edge-shreds/',
    'Edge Subscriber Connection': 'runbooks/subscribe-edge-shreds/',
    'Permissioned Connection': 'runbooks/permissioned-rpc/',
    'Other Multicast Connection': 'runbooks/other-multicast/',
    'setup': 'runbooks/install-client/',
    'troubleshooting': 'runbooks/troubleshoot-edge/'
  };

  function currentPageKey() {
    var parts = window.location.pathname.split('/').filter(Boolean);
    // drop locale prefix if present
    var locales = { zh: 1, ja: 1, ko: 1, pt: 1, es: 1, fr: 1, it: 1 };
    if (parts.length && locales[parts[0]]) parts = parts.slice(1);
    if (!parts.length) return null;
    return decodeURIComponent(parts[parts.length - 1]);
  }

  function siteRoot() {
    var parts = window.location.pathname.split('/').filter(Boolean);
    var locales = { zh: 1, ja: 1, ko: 1, pt: 1, es: 1, fr: 1, it: 1 };
    if (parts.length && locales[parts[0]]) {
      return window.location.origin + '/' + parts[0] + '/';
    }
    return window.location.origin + '/';
  }

  function runbookUrls(rel) {
    var root = siteRoot();
    var page = root + rel;
    return {
      page: page,
      markdown: page.replace(/\/?$/, '/') + 'index.md'
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
    // Claude uses ?q= (not ?prompt=). Open blank sync to avoid popup blockers,
    // then navigate after we have the prompt text.
    var url;
    if (service === 'claude') {
      url = 'https://claude.ai/new?q=' + encodeURIComponent(promptText);
    } else {
      url = 'https://chatgpt.com/?q=' + encodeURIComponent(promptText);
    }
    return url;
  }

  function askWithRunbook(service, mdUrl, pageUrl, btn) {
    var win = window.open('about:blank', '_blank');
    fetchMarkdown(mdUrl, function(md) {
      var prompt = md
        ? buildAgentPrompt(md, pageUrl)
        : 'Please fetch and follow this DoubleZero runbook step by step: ' + mdUrl;
      // Cap URL length (~12k) so the prefill still works in practice
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

  // Same fire mark Material uses for tip admonitions (material/fire)
  var TIP_FIRE_ICON =
    '<svg class="runbook-assist-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="currentColor" d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.08-3.61 5.75-2.39 8.9.04.1.08.2.08.33 0 .22-.15.42-.35.5-.23.1-.47.04-.66-.12a.6.6 0 0 1-.14-.17c-1.13-1.43-1.31-3.48-.55-5.12C5.78 10 4.87 12.3 5 14.47c.06.5.12 1 .29 1.5.14.6.41 1.2.71 1.73 1.08 1.73 2.95 2.97 4.96 3.22 2.14.27 4.43-.12 6.07-1.6 1.83-1.66 2.47-4.32 1.53-6.6l-.13-.26c-.21-.46-.77-1.26-.77-1.26m-3.16 6.3c-.28.24-.74.5-1.1.6-1.12.4-2.24-.16-2.9-.82 1.19-.28 1.9-1.16 2.11-2.05.17-.8-.15-1.46-.28-2.23-.12-.74-.1-1.37.17-2.06.19.38.39.76.63 1.06.77 1 1.98 1.44 2.24 2.8.04.14.06.28.06.43.03.82-.33 1.72-.93 2.27"/>' +
    '</svg>';

  function injectBanner(urls) {
    var content = document.querySelector('.md-content__inner');
    if (!content) return;
    var h1 = content.querySelector('h1');
    if (!h1) return;

    var banner = document.createElement('div');
    banner.className = 'runbook-assist runbook-assist--compact';
    banner.innerHTML =
      TIP_FIRE_ICON +
      '<p class="runbook-assist-copy">' +
        '<strong>Prefer the runbook</strong> — short checklist for bring-up, or paste it into your LLM.' +
      '</p>' +
      '<p class="runbook-assist-actions">' +
        '<a class="runbook-assist-btn" href="' + urls.page + '">Open runbook</a>' +
        '<button type="button" class="runbook-assist-btn runbook-assist-btn-secondary" id="runbook-copy-llm">Copy for LLM</button>' +
      '</p>';

    h1.insertAdjacentElement('afterend', banner);

    document.getElementById('runbook-copy-llm').addEventListener('click', function() {
      var btn = this;
      fetchMarkdown(urls.markdown, function(md) {
        if (!md) {
          btn.textContent = 'Failed';
          setTimeout(function() { btn.textContent = 'Copy for LLM'; }, 2000);
          return;
        }
        copyText(buildAgentPrompt(md, urls.page), btn);
      });
    });
  }

  function enhanceRunbookPage() {
    // On runbook pages themselves, highlight the footer Copy Page / Ask actions.
    var path = window.location.pathname;
    if (path.indexOf('/runbooks/') === -1) return;
    if (/\/runbooks\/?$/.test(path) || /\/runbooks\/index\/?$/.test(path)) return;

    var content = document.querySelector('.md-content__inner');
    var h1 = content && content.querySelector('h1');
    if (!h1) return;

    var note = document.createElement('div');
    note.className = 'runbook-assist runbook-assist--compact';
    note.innerHTML =
      TIP_FIRE_ICON +
      '<p class="runbook-assist-copy">' +
        '<strong>Use with an LLM</strong> — paste this checklist into Cursor, Claude, or ChatGPT.' +
      '</p>' +
      '<p class="runbook-assist-actions">' +
        '<button type="button" class="runbook-assist-btn" id="runbook-page-copy-llm">Copy for LLM</button>' +
        '<button type="button" class="runbook-assist-btn runbook-assist-btn-secondary" id="runbook-page-ask-claude">Ask Claude</button>' +
      '</p>';
    h1.insertAdjacentElement('afterend', note);

    var mdUrl = window.location.origin + window.location.pathname.replace(/\/?$/, '/') + 'index.md';
    var pageUrl = window.location.href;

    document.getElementById('runbook-page-copy-llm').addEventListener('click', function() {
      var btn = this;
      fetchMarkdown(mdUrl, function(md) {
        if (!md) { btn.textContent = 'Failed'; return; }
        copyText(buildAgentPrompt(md, pageUrl), btn);
      });
    });

    document.getElementById('runbook-page-ask-claude').addEventListener('click', function() {
      askWithRunbook('claude', mdUrl, pageUrl, this);
    });
  }

  function init() {
    enhanceRunbookPage();
    var key = currentPageKey();
    if (!key || !RUNBOOK_MAP[key]) return;
    injectBanner(runbookUrls(RUNBOOK_MAP[key]));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
