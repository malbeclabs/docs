// Connection Wizard - generates a personalized connection guide
// Pulls content from doc pages at runtime via data-wizard-step markers
(function() {
  'use strict';

  var state = {
    network: null,
    os: null,
    firewall: null,
    tenant: null,
    usertype: null,
    connection: null,
    multicastrole: null
  };

  var QUESTION_ORDER = ['network', 'os', 'tenant', 'firewall', 'usertype', 'connection', 'multicastrole'];

  var LABELS = {
    network: { 'mainnet-beta': 'Mainnet-Beta', 'testnet': 'Testnet' },
    os: { 'deb': 'Ubuntu / Debian', 'rpm': 'Rocky / RHEL' },
    firewall: { 'iptables': 'iptables', 'ufw': 'UFW' },
    tenant: { 'solana': 'Solana', 'shelby': 'Shelby', 'new-tenant': 'New Tenant' },
    usertype: { 'validator': 'Validator', 'rpc': 'RPC' },
    connection: { 'unicast': 'Unicast (IBRL)', 'multicast': 'Multicast', 'both': 'Both' },
    multicastrole: { 'publisher': 'Publisher', 'subscriber': 'Subscriber' }
  };

  function labelFor(question, value) {
    return (LABELS[question] && LABELS[question][value]) || value;
  }

  // --- Question Flow ---

  function getNextQuestion(currentQuestion) {
    switch (currentQuestion) {
      case 'network': return 'os';
      case 'os': return 'tenant';
      case 'tenant':
        if (state.tenant === 'new-tenant') return null;
        return 'firewall';
      case 'firewall':
        if (state.tenant === 'shelby') return null;
        return 'usertype';
      case 'usertype': return 'connection';
      case 'connection':
        if (state.connection === 'multicast' || state.connection === 'both') return 'multicastrole';
        return null;
      case 'multicastrole': return null;
      default: return null;
    }
  }

  function showQuestion(questionId) {
    var el = document.getElementById('wiz-q-' + questionId);
    if (!el) return;

    // Shelby is testnet-only
    if (questionId === 'tenant') {
      var shelbyCard = el.querySelector('[data-value="shelby"]');
      if (shelbyCard) {
        if (state.network === 'mainnet-beta') {
          shelbyCard.classList.add('wizard-card-disabled');
        } else {
          shelbyCard.classList.remove('wizard-card-disabled');
        }
      }
    }

    el.classList.remove('wizard-hidden');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function resetFrom(questionId) {
    var idx = QUESTION_ORDER.indexOf(questionId);
    for (var i = idx + 1; i < QUESTION_ORDER.length; i++) {
      var qEl = document.getElementById('wiz-q-' + QUESTION_ORDER[i]);
      if (qEl) {
        qEl.classList.add('wizard-hidden');
        var selected = qEl.querySelectorAll('.wizard-card-selected');
        for (var j = 0; j < selected.length; j++) {
          selected[j].classList.remove('wizard-card-selected');
        }
      }
      state[QUESTION_ORDER[i]] = null;
    }
    var output = document.getElementById('wizard-output');
    output.classList.add('wizard-hidden');
    output.innerHTML = '';
  }

  function resetAll() {
    for (var i = 0; i < QUESTION_ORDER.length; i++) {
      var qEl = document.getElementById('wiz-q-' + QUESTION_ORDER[i]);
      if (qEl) {
        if (i > 0) qEl.classList.add('wizard-hidden');
        var selected = qEl.querySelectorAll('.wizard-card-selected');
        for (var j = 0; j < selected.length; j++) {
          selected[j].classList.remove('wizard-card-selected');
        }
      }
      state[QUESTION_ORDER[i]] = null;
    }
    var output = document.getElementById('wizard-output');
    output.classList.add('wizard-hidden');
    output.innerHTML = '';
    var summary = document.getElementById('wizard-summary');
    summary.classList.add('wizard-hidden');
    summary.innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateSummary() {
    var summary = document.getElementById('wizard-summary');
    var chips = [];
    if (state.network) chips.push(labelFor('network', state.network));
    if (state.os) chips.push(labelFor('os', state.os));
    if (state.tenant) chips.push(labelFor('tenant', state.tenant));
    if (state.firewall) chips.push(labelFor('firewall', state.firewall));
    if (state.usertype) chips.push(labelFor('usertype', state.usertype));
    if (state.connection) chips.push(labelFor('connection', state.connection));
    if (state.multicastrole) chips.push(labelFor('multicastrole', state.multicastrole));

    if (chips.length === 0) {
      summary.classList.add('wizard-hidden');
      return;
    }

    summary.classList.remove('wizard-hidden');
    var html = '<div class="wizard-summary-chips">';
    for (var i = 0; i < chips.length; i++) {
      html += '<span class="wizard-chip">' + chips[i] + '</span>';
    }
    html += '</div><button id="wizard-reset" class="wizard-reset-btn">Start Over</button>';
    summary.innerHTML = html;

    document.getElementById('wizard-reset').addEventListener('click', resetAll);
  }

  // --- Page Fetcher + Cache ---

  var pageCache = {};

  function fetchPage(relativeUrl) {
    if (pageCache[relativeUrl]) return Promise.resolve(pageCache[relativeUrl]);
    return fetch(relativeUrl)
      .then(function(r) {
        if (!r.ok) throw new Error('Failed to fetch ' + relativeUrl + ': ' + r.status);
        return r.text();
      })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        pageCache[relativeUrl] = doc;
        return doc;
      });
  }

  function extractSection(doc, stepId) {
    var el = doc.querySelector('[data-wizard-step="' + stepId + '"]');
    if (!el) {
      console.warn('Wizard: section "' + stepId + '" not found');
      return null;
    }
    // Strip leading numbers (e.g. "2. " or "3. ") from headings so they
    // don't clash with the wizard's own step numbering.
    var clone = el.cloneNode(true);
    var headings = clone.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (var i = 0; i < headings.length; i++) {
      headings[i].innerHTML = headings[i].innerHTML.replace(/^\s*(?:\d+\.\s+|Step\s+\d+:\s*)/i, '');
    }
    return clone.innerHTML;
  }

  function rewriteLinks(container, sourcePage) {
    var links = container.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < links.length; i++) {
      links[i].setAttribute('href', sourcePage + links[i].getAttribute('href'));
    }
  }

  function addCopyButtons(container) {
    var pres = container.querySelectorAll('pre');
    for (var i = 0; i < pres.length; i++) {
      var pre = pres[i];
      // Skip if already wrapped
      if (pre.parentElement && pre.parentElement.classList.contains('wizard-code-wrapper')) continue;
      var wrapper = document.createElement('div');
      wrapper.className = 'wizard-code-wrapper';
      var btn = document.createElement('button');
      btn.className = 'wizard-copy-btn';
      btn.title = 'Copy to clipboard';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(btn);
      wrapper.appendChild(pre);
    }
  }

  // --- Helper to resolve connection page URL and section prefix ---

  function connectionPage(s) {
    var prefix = s.network === 'mainnet-beta' ? 'mainnet' : 'testnet';
    var page = s.network === 'mainnet-beta'
      ? '../DZ%20Mainnet-beta%20Connection/'
      : '../DZ%20Testnet%20Connection/';
    return { prefix: prefix, page: page };
  }

  // --- Declarative Step Config ---

  var PLAN_STEPS = [
    {
      id: 'install',
      title: 'Install DoubleZero',
      show: function() { return true; },
      beforeContent: '<div class="admonition info"><p class="admonition-title">Prerequisites</p>' +
        '<p>Before you begin, complete <strong>Step 1</strong> of the <a href="../setup/">Setup guide</a> to install the DoubleZero CLI and generate your identity.</p></div>',
      sources: function(s) {
        return [
          { page: '../setup/', section: 'install-version-info' },
          { page: '../setup/', section: 'install-' + s.os + '-' + s.network },
          { page: '../setup/', section: 'install-verify-daemon' }
        ];
      }
    },
    {
      id: 'env-config',
      title: 'Configure Environment',
      show: function() { return true; },
      sources: function(s) {
        if (s.tenant === 'shelby') {
          return [{ page: '../DZ%20Testnet%20Connection/', section: 'testnet-env-config' }];
        }
        var c = connectionPage(s);
        return [{ page: c.page, section: c.prefix + '-env-config' }];
      }
    },
    {
      id: 'firewall',
      title: 'Configure Firewall',
      show: function() { return true; },
      sources: function(s) {
        var sources = [];
        sources.push({ page: '../setup/', section: 'firewall-gre-bgp-' + s.firewall });
        if (s.tenant == 'solana') {
          sources.push({ page: connectionPage(s).page, section: 'firewall-' + s.firewall });
        }
        return sources;
      }
    },
    {
      id: 'find-validator',
      title: 'Verify Validator Identity',
      show: function(s) { return s.usertype === 'validator'; },
      sources: function(s) {
        var c = connectionPage(s);
        return [{ page: c.page, section: c.prefix + '-find-validator' }];
      }
    },
    {
      id: 'prepare-access',
      title: 'Prepare Connection Request',
      show: function(s) { return s.usertype === 'validator'; },
      sources: function(s) {
        var c = connectionPage(s);
        return [{ page: c.page, section: c.prefix + '-prepare-access' }];
      }
    },
    {
      id: 'sign-message',
      title: 'Sign with Validator Identity',
      show: function(s) { return s.usertype === 'validator'; },
      sources: function(s) {
        var c = connectionPage(s);
        return [{ page: c.page, section: c.prefix + '-sign-message' }];
      }
    },
    {
      id: 'request-access',
      title: 'Submit Access Request',
      show: function(s) { return s.usertype === 'validator'; },
      sources: function(s) {
        var c = connectionPage(s);
        return [{ page: c.page, section: c.prefix + '-request-access' }];
      }
    },
    {
      id: 'rpc-onboarding',
      title: 'Permissioned User Onboarding',
      show: function(s) { return s.usertype === 'rpc' || s.tenant === 'shelby'; },
      sources: function(s) {
        var page = s.tenant === 'shelby'
          ? '../Shelby%20Permissioned%20Connection/'
          : '../Permissioned%20Connection/';
        return [{ page: page, section: 'rpc-onboarding' }];
      }
    },
    {
      id: 'connect-ibrl',
      title: 'Connect in IBRL Mode',
      show: function(s) { return s.tenant === 'shelby' || s.connection === 'unicast' || s.connection === 'both'; },
      sources: function(s) {
        if (s.tenant === 'shelby') {
          return [{ page: '../Shelby%20Permissioned%20Connection/', section: 'rpc-connect-ibrl' }];
        }
        if (s.usertype === 'rpc') {
          return [{ page: '../Permissioned%20Connection/', section: 'rpc-connect-ibrl' }];
        }
        var c = connectionPage(s);
        return [{ page: c.page, section: c.prefix + '-connect-ibrl' }];
      }
    },
    {
      id: 'connect-multicast',
      title: function(s) {
        var role = s.multicastrole === 'publisher' ? 'Publisher' : 'Subscriber';
        return 'Connect in Multicast Mode (' + role + ')';
      },
      show: function(s) { return s.connection === 'multicast' || s.connection === 'both'; },
      sources: function(s) {
        return [{ page: '../Other%20Multicast%20Connection/', section: 'multicast-connect-' + s.multicastrole }];
      },
      beforeContent: function(s) {
        if (s.connection === 'both') {
          return '<div class="admonition info"><p class="admonition-title">Simultaneous Tunnels</p>' +
            '<p>Since v0.8.4, simultaneous unicast and multicast tunnels are supported. ' +
            'Your unicast tunnel (<code>doublezero0</code>) will remain active.</p></div>';
        }
        return '';
      }
    },
    {
      id: 'verify-multicast',
      title: 'Verify Multicast Connection',
      show: function(s) { return s.connection === 'multicast' || s.connection === 'both'; },
      sources: function(s) {
        return [{ page: '../Other%20Multicast%20Connection/', section: 'multicast-verify-' + s.multicastrole }];
      }
    },
    {
      id: 'fees',
      title: 'Set Up Fee Payments',
      show: function(s) { return s.usertype === 'validator' && s.network === 'mainnet-beta'; },
      sources: function() {
        return [
          { page: '../paying-fees/', section: 'fee-check' },
          { page: '../paying-fees/', section: 'fee-pay' }
        ];
      },
      afterContent: '<p>See <a href="../paying-fees/">Paying Fees</a> and <a href="../paying-fees2z/">Paying with 2Z</a> for more details.</p>'
    }
  ];

  // --- Plan Rendering ---

  function buildSummaryLine() {
    var networkLabel = state.network === 'mainnet-beta' ? 'Mainnet-Beta' : 'Testnet';

    if (state.tenant === 'shelby') {
      return '<p class="wizard-summary-line">Connect to DoubleZero <strong>' + networkLabel +
        '</strong> as a <strong>Shelby</strong> permissioned user on <strong>' +
        labelFor('os', state.os) + '</strong>.</p>';
    }

    var connLabel = state.connection === 'both' ? 'unicast + multicast'
      : state.connection === 'unicast' ? 'unicast (IBRL)' : 'multicast';
    var roleNote = state.multicastrole ? ' as a ' + state.multicastrole : '';
    var typeLabel = state.usertype === 'validator' ? 'Solana validator' : 'Solana RPC node';

    return '<p class="wizard-summary-line">Connect via <strong>' + connLabel + '</strong>' +
      roleNote + ' to DoubleZero <strong>' + networkLabel + '</strong> as a <strong>' + typeLabel +
      '</strong> on <strong>' + labelFor('os', state.os) + '</strong>.</p>';
  }

  function renderFallback() {
    var networkLabel = state.network === 'mainnet-beta' ? 'Mainnet-Beta' : 'Testnet';
    return '<div class="admonition warning">' +
      '<p class="admonition-title">Could not load guide content</p>' +
      '<p>Please follow the individual guides instead:</p><ul>' +
      '<li><a href="../setup/">Setup &amp; Installation</a></li>' +
      (state.network === 'mainnet-beta'
        ? '<li><a href="../DZ%20Mainnet-beta%20Connection/">Mainnet-Beta Connection</a></li>'
        : '<li><a href="../DZ%20Testnet%20Connection/">Testnet Connection</a></li>') +
      (state.tenant === 'shelby'
        ? '<li><a href="../Shelby%20Permissioned%20Connection/">Shelby Permissioned Connection</a></li>' : '') +
      (state.usertype === 'rpc' && state.tenant !== 'shelby'
        ? '<li><a href="../Permissioned%20Connection/">Permissioned Connection</a></li>' : '') +
      (state.connection !== 'unicast'
        ? '<li><a href="../Other%20Multicast%20Connection/">Other Multicast Connection</a></li>' : '') +
      (state.usertype === 'validator' && state.network === 'mainnet-beta'
        ? '<li><a href="../paying-fees/">Paying Fees</a></li>' : '') +
      '</ul></div>';
  }

  function renderPlan() {
    var output = document.getElementById('wizard-output');

    // Show loading spinner
    output.innerHTML = '<div class="wizard-loading"><p>Loading your connection guide...</p></div>';
    output.classList.remove('wizard-hidden');

    // Filter active steps
    var activeSteps = [];
    for (var i = 0; i < PLAN_STEPS.length; i++) {
      if (PLAN_STEPS[i].show(state)) {
        activeSteps.push(PLAN_STEPS[i]);
      }
    }

    // Collect unique page URLs to fetch
    var pageUrls = {};
    for (var i = 0; i < activeSteps.length; i++) {
      var sources = activeSteps[i].sources(state);
      for (var j = 0; j < sources.length; j++) {
        pageUrls[sources[j].page] = true;
      }
    }

    // Fetch all pages in parallel
    var urls = Object.keys(pageUrls);
    var fetchPromises = [];
    for (var i = 0; i < urls.length; i++) {
      fetchPromises.push(fetchPage(urls[i]));
    }

    Promise.all(fetchPromises)
      .then(function() {
        var stepsHtml = '';

        for (var i = 0; i < activeSteps.length; i++) {
          var step = activeSteps[i];
          var stepNum = i + 1;
          var title = typeof step.title === 'function' ? step.title(state) : step.title;

          // Collect section HTML from sources
          var sources = step.sources(state);
          var contentParts = [];
          for (var j = 0; j < sources.length; j++) {
            var doc = pageCache[sources[j].page];
            if (doc) {
              var html = extractSection(doc, sources[j].section);
              if (html) {
                contentParts.push({ html: html, page: sources[j].page });
              }
            }
          }

          // Build step HTML
          var beforeContent = '';
          if (typeof step.beforeContent === 'function') {
            beforeContent = step.beforeContent(state);
          } else if (typeof step.beforeContent === 'string') {
            beforeContent = step.beforeContent;
          }

          var afterContent = '';
          if (typeof step.afterContent === 'function') {
            afterContent = step.afterContent(state);
          } else if (typeof step.afterContent === 'string') {
            afterContent = step.afterContent;
          }

          var sectionContent = '';
          if (contentParts.length > 0) {
            for (var k = 0; k < contentParts.length; k++) {
              sectionContent += '<div class="wizard-section-content" data-source-page="' + contentParts[k].page + '">' +
                contentParts[k].html + '</div>';
            }
          } else {
            // All sources missing — show fallback link
            var firstSource = sources[0];
            sectionContent = '<p>See <a href="' + firstSource.page + '">the full guide</a> for details on this step.</p>';
          }

          stepsHtml += '<div class="wizard-step">' +
            '<h3>Step ' + stepNum + ': ' + title + '</h3>' +
            beforeContent + sectionContent + afterContent +
            '</div>';
        }

        output.innerHTML =
          '<h2>Your Connection Guide</h2>' +
          buildSummaryLine() +
          '<div class="wizard-plan">' + stepsHtml + '</div>' +
          '<div class="wizard-plan-footer">' +
          '<p>Having trouble? See the <a href="../troubleshooting/">Troubleshooting guide</a> or ask in the ' +
          '<a href="https://discord.com/channels/1341597747932958802/1344323790464880701" target="_blank">DoubleZero Tech Discord</a>.</p>' +
          '</div>';

        // Rewrite anchor-only links to point to source pages
        var sections = output.querySelectorAll('.wizard-section-content');
        for (var i = 0; i < sections.length; i++) {
          var sourcePage = sections[i].getAttribute('data-source-page');
          if (sourcePage) {
            rewriteLinks(sections[i], sourcePage);
          }
        }

        // Add copy buttons to extracted code blocks
        addCopyButtons(output);

        output.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Re-run cloudsmith version replacements on new content
        if (typeof window.__dzRefreshVersions === 'function') {
          window.__dzRefreshVersions();
        }
      })
      .catch(function(err) {
        console.error('Wizard: failed to load content', err);
        output.innerHTML =
          '<h2>Your Connection Guide</h2>' +
          buildSummaryLine() +
          renderFallback();
        output.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
  }

  function renderNewTenantMessage() {
    var output = document.getElementById('wizard-output');
    output.innerHTML =
      '<div class="admonition info">' +
      '<p class="admonition-title">New Tenant</p>' +
      '<p>See the <a href="../New%20Tenant/">New Tenant</a> page for details on connecting a new ecosystem to DoubleZero.</p>' +
      '</div>';
    output.classList.remove('wizard-hidden');
    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // --- Click Handler ---

  function handleClick(e) {
    var card = e.target.closest('.wizard-card');
    if (!card || card.classList.contains('wizard-card-disabled')) return;

    var question = card.dataset.question;
    var value = card.dataset.value;

    // If re-answering, clear subsequent state
    if (state[question] !== null && state[question] !== value) {
      resetFrom(question);
    }

    // Update state
    state[question] = value;

    // Mark selected
    var siblings = card.parentElement.querySelectorAll('.wizard-card');
    for (var i = 0; i < siblings.length; i++) {
      siblings[i].classList.remove('wizard-card-selected');
    }
    card.classList.add('wizard-card-selected');

    // Next step
    var next = getNextQuestion(question);

    if (next === null) {
      if (state.tenant === 'new-tenant') {
        renderNewTenantMessage();
      } else {
        renderPlan();
      }
    } else {
      showQuestion(next);
    }

    updateSummary();
  }

  // --- Copy Button Handler ---

  function handleCopy(e) {
    var btn = e.target.closest('.wizard-copy-btn');
    if (!btn) return;
    // Find the <pre> sibling within the same wrapper
    var wrapper = btn.parentElement;
    var pre = wrapper && wrapper.querySelector('pre');
    if (!pre) return;
    var text = pre.textContent;
    navigator.clipboard.writeText(text).then(function() {
      btn.classList.add('wizard-copied');
      setTimeout(function() { btn.classList.remove('wizard-copied'); }, 2000);
    });
  }

  // --- Init ---

  function init() {
    var container = document.getElementById('wizard-container');
    if (!container) return;

    container.addEventListener('click', handleClick);
    document.addEventListener('click', handleCopy);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
