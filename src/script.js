(function ($) {
  'use strict';

  // Devel
  window.log = (m) => {
    console.log(m);
  };

  var GVMap = class {
    constructor() {
      // Load the first non semantic database.
      this.ajax({
        url: 'src/data.json', success: (e) => {
          this.data = JSON.parse(e.responseText);
          // Shortcuts.
          this.searchTextInput = this.domId('searchText');
          this.searchResults = this.domId('searchResults');
          // Listeners.
          this.listen('searchForm', ['submit', 'keyup'], (e) => {
            e.preventDefault();
            this.search(this.searchTextInput.value);
          });
          this.searchTextInput.focus();
          // TODO temp
          this.search('des');
        }
      });
    }

    search(term) {
      let results = [];
      let value;

      this.searchResults.innerHTML = '';

      // This search method is temporary.
      // Iterates over items.
      for (let itemId in this.data) {
        // Iterates over fields.
        for (let key in this.data[itemId]) {
          value = this.data[itemId][key];
          if (value && value.indexOf && value.indexOf(term) !== -1) {
            // Use id as key to prevent duplicates.
            results[itemId] = itemId;
          }
        }
      }

      // Display results.
      this.searchResults.style.display = 'block';

      for (let itemId in results) {
        let result = document.createElement('search-result');
        let data = this.data[itemId];
        result.title = data['Nom pour communication'];
        result.description = data['Activité'];
        this.searchResults.appendChild(result);
      }
    }

    listen(id, event, callback) {
      // Support list of events names.
      if (Array.isArray(event)) {
        for (let i in event) {
          this.listen(id,event[i],callback);
        }
        return;
      }
      return this.domId(id).addEventListener(event, callback);
    }

    domId(id) {
      return document.getElementById(id);
    }

    dom(selector) {
      return document.querySelectorAll(selector);
    }

    /**
     * Simple AJAX request
     * @param {Object} options Contain various ajax options.
     */
    ajax(options) {
      var xhr = new window.XMLHttpRequest(),
        data = options.data ? this.param(options.data) : undefined,
        method = options.method || 'GET', success = options.success,
        url = options.url;
      // Create xhr.
      xhr.open(method,
        // On GET mode append data as query strings.
        method === 'GET' && data ? url + '?' + data : url,
        // Async by default.
        options.async !== undefined ? options.async : true);
      // Define callback.
      xhr.onreadystatechange = function () {
        // Process complete.
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            // Callback function specified.
            if (success && typeof success === 'function') {
              success(xhr);
            }
          }
          else if (options.error) {
            options.error(xhr);
          }
        }
      };
      // Requested headers.
      if (method === 'POST') {
        xhr.setRequestHeader('Content-type',
          'application/x-www-form-urlencoded');
      }
      // Lets go.
      xhr.send(data);
    }

    renderSearchResult(data) {

    }
  };

  window.addEventListener('load', function () {
    new GVMap();
  });
}(jQuery));
