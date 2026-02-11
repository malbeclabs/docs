// Fetch latest package versions from Cloudsmith API and display in docs
(function() {
  var CLOUDSMITH_API_MAINNET = 'https://api.cloudsmith.io/v1/packages/malbeclabs/doublezero/';
  var CLOUDSMITH_API_TESTNET = 'https://api.cloudsmith.io/v1/packages/malbeclabs/doublezero-testnet/';

  // Cache fetched values so dynamically generated content can be updated
  var versionCache = {};

  var packages = [
    // Mainnet packages
    {
      name: 'doublezero-agent',
      api: CLOUDSMITH_API_MAINNET,
      urlPlaceholder: 'AGENT_DOWNLOAD_URL',
      filenamePlaceholder: 'AGENT_FILENAME'
    },
    {
      name: 'doublezero-device-telemetry-agent',
      api: CLOUDSMITH_API_MAINNET,
      urlPlaceholder: 'TELEMETRY_DOWNLOAD_URL',
      filenamePlaceholder: 'TELEMETRY_FILENAME'
    },
    {
      name: 'doublezero',
      api: CLOUDSMITH_API_MAINNET,
      versionPlaceholder: 'MAINNET_CLIENT_VERSION',
      format: 'deb' // Filter to deb to get consistent version
    },
    // Testnet packages
    {
      name: 'doublezero',
      api: CLOUDSMITH_API_TESTNET,
      versionPlaceholder: 'TESTNET_CLIENT_VERSION',
      format: 'deb'
    },
    {
      name: 'doublezero-agent',
      api: CLOUDSMITH_API_TESTNET,
      urlPlaceholder: 'TESTNET_AGENT_DOWNLOAD_URL',
      filenamePlaceholder: 'TESTNET_AGENT_FILENAME'
    },
    {
      name: 'doublezero-device-telemetry-agent',
      api: CLOUDSMITH_API_TESTNET,
      urlPlaceholder: 'TESTNET_TELEMETRY_DOWNLOAD_URL',
      filenamePlaceholder: 'TESTNET_TELEMETRY_FILENAME'
    }
  ];

  function replaceInCodeBlocks(placeholder, value) {
    var codeBlocks = document.querySelectorAll('pre code, code');
    for (var i = 0; i < codeBlocks.length; i++) {
      var el = codeBlocks[i];
      if (el.innerHTML.indexOf(placeholder) !== -1) {
        el.innerHTML = el.innerHTML.split(placeholder).join(value);
      }
    }
  }

  function fetchAndUpdate() {
    packages.forEach(function(pkg) {
      var query = 'name:^' + pkg.name + '$';
      if (pkg.format) {
        query += '+format:' + pkg.format;
      }
      var url = pkg.api + '?query=' + query + '&page_size=1';

      fetch(url)
        .then(function(response) { return response.json(); })
        .then(function(data) {
          if (data && data.length > 0) {
            var info = data[0];

            // Replace URL placeholder
            if (pkg.urlPlaceholder && info.cdn_url) {
              versionCache[pkg.urlPlaceholder] = info.cdn_url;
              replaceInCodeBlocks(pkg.urlPlaceholder, info.cdn_url);
            }

            // Replace filename placeholder
            if (pkg.filenamePlaceholder && info.filename) {
              versionCache[pkg.filenamePlaceholder] = info.filename;
              replaceInCodeBlocks(pkg.filenamePlaceholder, info.filename);
            }

            // Replace version placeholder (extract version from package)
            if (pkg.versionPlaceholder && info.version) {
              versionCache[pkg.versionPlaceholder] = info.version;
              replaceInCodeBlocks(pkg.versionPlaceholder, info.version);
            }
          }
        })
        .catch(function(err) {
          console.error('Failed to fetch ' + pkg.name + ' version:', err);
        });
    });
  }

  // Expose refresh function for dynamically generated content (e.g., connection wizard)
  window.__dzRefreshVersions = function() {
    var keys = Object.keys(versionCache);
    for (var i = 0; i < keys.length; i++) {
      replaceInCodeBlocks(keys[i], versionCache[keys[i]]);
    }
  };

  if (document.readyState === 'complete') {
    fetchAndUpdate();
  } else {
    window.addEventListener('load', fetchAndUpdate);
  }
})();
