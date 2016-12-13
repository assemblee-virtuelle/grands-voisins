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
      this.buildings = {
        "maisonDesMedecins": "Maison des médecins",
        "lepage": "Lepage",
        "pinard": "Pinard",
        "lelong": "Lelong",
        "pierrePetit": "Pierre Petit",
        "laMediatheque": "La Médiathèque",
        "ced": "CED",
        "oratoire": "Oratoire",
        "colombani": "Colombani",
        "laLingerie": "La Lingerie",
        "laChaufferie": "La Chaufferie",
        "robin": "Robin",
        "pasteur": "Pasteur",
        "jalaguier": "Jalaguier",
        "rapine": "Rapine"
      };

      var final = [];
      for (let i in this.buildings) {
        final.push({
          key: i,
          name: this.buildings[i]
        });
      }
      this.mainComponent.buildings = final;

      // Special class for dev env.
      if (window.location.hostname === '127.0.0.1') {
        window.document.body.classList.add('dev-env');
      }
      // Load the first non semantic database.
      this.ajax({
        url: '/src/data.json', success: (e) => {
          this.data = JSON.parse(e.responseText);
          // Shortcuts.
          this.domSearchTextInput = this.domId('searchText');
          this.domSearchResults = this.domId('searchResults');
          this.domSearchTabs = this.domId('searchTabs');
          this.domDetail = this.domId('detail');
          this.domSearchSelectBuilding = this.domId('searchSelectBuilding');
          // Listeners.
          var callback = this.searchEvent.bind(this);
          this.listen('searchText', ['submit', 'keyup'], callback);
          this.listen('searchSelectBuilding', ['change'], callback);
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

    searchEvent(e) {
      e.preventDefault();
      var term = this.domSearchTextInput.value;
      var building = this.domSearchSelectBuilding.value;
      this.search(term, {
        updateSearchField: false,
        building: building
      });
      // Save state into URL.
      this.mainComponent.set('route.path', '/search/' + building + '/' + term);
    }

    search(term, options = {}) {
      let results = [];
      let value;

      this.stateSet('search');

      // Set value to input (used at first page load)
      if (options.updateSearchField !== undefined || options.updateSearchField) {
        this.domSearchTextInput.value = term;
        this.domSearchSelectBuilding.value = options.building;
      }

      // Empty content.
      this.domSearchResults.innerHTML = '';

      term = term.toLowerCase();

      // This search method is temporary.
      // Iterates over items.
      for (let itemId in this.data) {
        // Filter by building.
        if (options.building === 'all' || this.data[itemId]['Bâtiment'] === this.buildings[options.building]) {
          // Iterates over fields.
          for (let key in this.data[itemId]) {
            value = this.data[itemId][key];
            if (!term || (value && value.indexOf && value.toLowerCase().indexOf(term) !== -1)) {
              // Use id as key to prevent duplicates.
              results[itemId] = itemId;
            }
          }
        }
      }

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

    buildingGetKey(name) {
      for (let i in this.buildings) {
        if (this.buildings[i] === name) {
          return i;
        }
      }
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
