(function () {
  'use strict';
  // Devel
  window.log = (m) => {
    console.log(m);
  };

  var readyCallbacks = [];

  window.GVCarto = class {
    constructor(mainComponent) {
      window.gvc = this;
      this.mainComponent = mainComponent;
      // Load the first non semantic database.
      this.ajax({
        url: '/src/data.json', success: (e) => {
          this.data = JSON.parse(e.responseText);
          // Shortcuts.
          this.domSearchTextInput = this.domId('searchText');
          this.domSearchResults = this.domId('searchResults');
          this.domSearchTabs = this.domId('searchTabs');
          this.domDetail = this.domId('detail');
          // Listeners.
          this.listen('searchForm', ['submit', 'keyup'], (e) => {
            e.preventDefault();
            this.search(this.domSearchTextInput.value, false);
          });
          // Launch callbacks
          this.isReady = true;
          //this.domSearchTextInput.focus();
          this.stateSet('waiting');
          for (let i in readyCallbacks) {
            readyCallbacks[i]();
          }
        }
      });
    }

    stateSet(stateName) {
      if (this.stateCurrent !== stateName) {
        let nameCapitalized = stateName.charAt(0).toUpperCase() + stateName.slice(1);
        if (this.stateCurrent) {
          let nameCurrentCapitalized = this.stateCurrent.charAt(0).toUpperCase() + this.stateCurrent.slice(1);
          this['state' + nameCurrentCapitalized + 'Exit']();
          this.stateCurrent = null;
        }
        // Callback should not return false if success.
        if (this['state' + nameCapitalized + 'Init']() !== false) {
          this.stateCurrent = stateName;
        }
      }
    }

    /* -- Waiting --*/
    stateWaitingInit() {

    }

    stateWaitingExit() {

    }

    /* -- Search -- */

    stateSearchInit() {
      if (!this.domSearchTextInput.value) {
        this.stateSet('waiting');
        // Block saving current state.
        return false;
      }
    }

    stateSearchExit() {

    }

    search(term, updateSearchField = true) {
      let results = [];
      let value;

      this.stateSet('search');

      // Set value to input (used at first page load)
      if (updateSearchField) {
        this.domSearchTextInput.value = term;
      }

      // Empty content.
      this.domSearchResults.innerHTML = '';

      term = term.toLowerCase();

      // This search method is temporary.
      // Iterates over items.
      for (let itemId in this.data) {
        // Iterates over fields.
        for (let key in this.data[itemId]) {
          value = this.data[itemId][key];
          if (value && value.indexOf && value.toLowerCase().indexOf(term) !== -1) {
            // Use id as key to prevent duplicates.
            results[itemId] = itemId;
          }
        }
      }

      // Save state into URL.
      this.mainComponent.set('route.path', '/search/' + term);

      for (let itemId in results) {
        let result = document.createElement('search-result');
        let data = this.data[itemId];
        result.title = data['Nom pour communication'];
        result.description = data['Activité'];
        result.id = itemId;
        this.domSearchResults.appendChild(result);
      }
    }

    /* -- Detail -- */

    stateDetailInit() {
      // Display zone.
      this.domDetail.style.display = 'block';
    }

    stateDetailExit() {
      // Set to default (hidden).
      this.domDetail.style.display = null;
    }

    detail(id) {
      this.stateSet('detail');
    }

    listen(id, event, callback) {
      // Support list of events names.
      if (Array.isArray(event)) {
        for (let i in event) {
          this.listen(id, event[i], callback);
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

  window.GVCarto.ready = function (callback) {
    if (!window.gvc || !window.gvc.isReady) {
      readyCallbacks.push(callback);
    }
    else {
      callback();
    }
  };
}());
