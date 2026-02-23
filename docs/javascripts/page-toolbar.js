// Page toolbar functionality for documentation pages
// Adds toolbar with Copy Page, View Markdown, Ask in ChatGPT, and Ask in Claude
(function() {
  'use strict';

  // Check if we're on the setup page
  function isSetupPage() {
    // Check if current page path includes 'setup'
    var path = window.location.pathname;
    // Handle various URL formats: /setup/, /setup, /setup.html, /users/setup/, etc.
    var normalizedPath = path.replace(/\/$/, '').replace(/\.html$/, '').toLowerCase();
    return normalizedPath.endsWith('/setup') || normalizedPath.endsWith('setup') || 
           normalizedPath === '/setup' || normalizedPath === 'setup';
  }

  // Create the toolbar HTML
  function createToolbar() {
    var toolbar = document.createElement('div');
    toolbar.className = 'page-toolbar';
    toolbar.innerHTML = 
      '<a href="#" class="page-toolbar-link" id="copy-page-btn">' +
        '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Crect x=\'9\' y=\'9\' width=\'13\' height=\'13\' rx=\'2\' ry=\'2\'%3E%3C/rect%3E%3Cpath d=\'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1\'%3E%3C/path%3E%3C/svg%3E" class="page-toolbar-icon" alt="" />' +
        'Copy Page' +
      '</a>' +
      '<span class="page-toolbar-separator">|</span>' +
      '<a href="#" class="page-toolbar-link" id="view-markdown-btn">' +
        '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\'%3E%3C/path%3E%3Cpolyline points=\'14 2 14 8 20 8\'%3E%3C/polyline%3E%3Cline x1=\'16\' y1=\'13\' x2=\'8\' y2=\'13\'%3E%3C/line%3E%3Cline x1=\'16\' y1=\'17\' x2=\'8\' y2=\'17\'%3E%3C/line%3E%3Cpolyline points=\'10 9 9 9 8 9\'%3E%3C/polyline%3E%3C/svg%3E" class="page-toolbar-icon" alt="" />' +
        'View Markdown' +
      '</a>' +
      '<span class="page-toolbar-separator">|</span>' +
      '<a href="#" class="page-toolbar-link" id="ask-chatgpt-btn">' +
        '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' fill=\'%23ffffff\' viewBox=\'0 0 256 256\'%3E%3Cpath d=\'M224.32,114.24a56,56,0,0,0-60.07-76.57A56,56,0,0,0,67.93,51.44a56,56,0,0,0-36.25,90.32A56,56,0,0,0,69,217,56.39,56.39,0,0,0,83.59,219a55.75,55.75,0,0,0,8.17-.61,56,56,0,0,0,96.31-13.78,56,56,0,0,0,36.25-90.32ZM182.85,54.43a40,40,0,0,1,28.56,48c-.95-.63-1.91-1.24-2.91-1.81L164,74.88a8,8,0,0,0-8,0l-44,25.41V81.81l40.5-23.38A39.76,39.76,0,0,1,182.85,54.43ZM144,137.24l-16,9.24-16-9.24V118.76l16-9.24,16,9.24ZM80,72a40,40,0,0,1,67.53-29c-1,.51-2,1-3,1.62L100,70.27a8,8,0,0,0-4,6.92V128l-16-9.24ZM40.86,86.93A39.75,39.75,0,0,1,64.12,68.57C64.05,69.71,64,70.85,64,72v51.38a8,8,0,0,0,4,6.93l44,25.4L96,165,55.5,141.57A40,40,0,0,1,40.86,86.93ZM73.15,201.57a40,40,0,0,1-28.56-48c.95.63,1.91,1.24,2.91,1.81L92,181.12a8,8,0,0,0,8,0l44-25.41v18.48l-40.5,23.38A39.76,39.76,0,0,1,73.15,201.57ZM176,184a40,40,0,0,1-67.52,29.05c1-.51,2-1.05,3-1.63L156,185.73a8,8,0,0,0,4-6.92V128l16,9.24Zm39.14-14.93a39.75,39.75,0,0,1-23.26,18.36c.07-1.14.12-2.28.12-3.43V132.62a8,8,0,0,0-4-6.93l-44-25.4,16-9.24,40.5,23.38A40,40,0,0,1,215.14,169.07Z\'/%3E%3C/svg%3E" class="page-toolbar-icon" alt="" />' +
        'Ask in ChatGPT' +
      '</a>' +
      '<span class="page-toolbar-separator">|</span>' +
      '<a href="#" class="page-toolbar-link" id="ask-claude-btn">' +
        '<img src="https://www.google.com/s2/favicons?domain=claude.ai&sz=16" class="page-toolbar-icon page-toolbar-favicon" alt="" />' +
        'Ask in Claude' +
      '</a>';
    return toolbar;
  }

  // Get page content as text
  function getPageContent() {
    var content = document.querySelector('.md-content__inner');
    if (!content) {
      content = document.querySelector('main');
    }
    if (!content) {
      content = document.body;
    }
    return content ? content.innerText || content.textContent : '';
  }

  // Get page title
  function getPageTitle() {
    var title = document.querySelector('h1');
    return title ? title.textContent.trim() : document.title;
  }

  // Copy page content to clipboard
  function copyPageToClipboard() {
    var content = getPageContent();
    var title = getPageTitle();
    var textToCopy = title + '\n\n' + content;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(function() {
        showCopyFeedback('copy-page-btn');
      }).catch(function(err) {
        console.error('Failed to copy:', err);
        fallbackCopy(textToCopy);
      });
    } else {
      fallbackCopy(textToCopy);
    }
  }

  // Fallback copy method for older browsers
  function fallbackCopy(text) {
    var textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showCopyFeedback('copy-page-btn');
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textArea);
  }

  // Show copy feedback
  function showCopyFeedback(buttonId) {
    var btn = document.getElementById(buttonId);
    if (btn) {
      var icon = btn.querySelector('.page-toolbar-icon');
      var textNode = Array.from(btn.childNodes).find(function(node) {
        return node.nodeType === 3 && node.textContent.trim();
      });
      if (textNode) {
        var originalText = textNode.textContent.trim();
        textNode.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function() {
          textNode.textContent = originalText;
          btn.classList.remove('copied');
        }, 2000);
      }
    }
  }

  // View markdown source
  function viewMarkdown() {
    // Get the current page path
    var path = window.location.pathname;
    // Remove leading/trailing slashes and .html extension
    path = path.replace(/^\/|\/$/g, '').replace(/\.html$/, '');
    
    // Default to setup.md if path is empty or just 'setup'
    if (!path || path === 'setup') {
      path = 'setup';
    }
    
    // Construct GitHub raw URL
    // Repository: malbeclabs/docs
    var repoOwner = 'malbeclabs';
    var repoName = 'docs';
    var branch = 'main';
    
    // Try to construct GitHub raw URL
    var markdownUrl = 'https://raw.githubusercontent.com/' + repoOwner + '/' + repoName + '/' + branch + '/docs/' + path + '.md';
    
    // Open in new tab
    window.open(markdownUrl, '_blank');
  }

  // Ask in ChatGPT
  function askInChatGPT() {
    var content = getPageContent();
    var title = getPageTitle();
    var prompt = 'I\'m reading this documentation page: "' + title + '"\n\n' + content.substring(0, 3000) + (content.length > 3000 ? '...' : '');
    var url = 'https://chat.openai.com/?q=' + encodeURIComponent(prompt);
    window.open(url, '_blank');
  }

  // Ask in Claude
  function askInClaude() {
    var content = getPageContent();
    var title = getPageTitle();
    var prompt = 'I\'m reading this documentation page: "' + title + '"\n\n' + content.substring(0, 3000) + (content.length > 3000 ? '...' : '');
    var url = 'https://claude.ai/new?prompt=' + encodeURIComponent(prompt);
    window.open(url, '_blank');
  }

  // Initialize toolbar
  function initToolbar() {
    // Only add toolbar on setup page
    if (!isSetupPage()) {
      return;
    }

    // Wait for page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        addToolbar();
      });
    } else {
      addToolbar();
    }
  }

  // Add toolbar to page
  function addToolbar() {
    // Create a fixed footer at the bottom of the screen
    var footer = document.createElement('footer');
    footer.className = 'page-toolbar-footer';
    
    // Create and insert toolbar
    var toolbar = createToolbar();
    footer.appendChild(toolbar);
    
    // Insert at the end of body
    document.body.appendChild(footer);

    // Attach event listeners
    document.getElementById('copy-page-btn').addEventListener('click', function(e) {
      e.preventDefault();
      copyPageToClipboard();
    });
    document.getElementById('view-markdown-btn').addEventListener('click', function(e) {
      e.preventDefault();
      viewMarkdown();
    });
    document.getElementById('ask-chatgpt-btn').addEventListener('click', function(e) {
      e.preventDefault();
      askInChatGPT();
    });
    document.getElementById('ask-claude-btn').addEventListener('click', function(e) {
      e.preventDefault();
      askInClaude();
    });
  }

  // Initialize when script loads
  initToolbar();
})();
