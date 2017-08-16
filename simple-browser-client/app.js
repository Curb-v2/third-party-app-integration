(function(){
  var ID_TOKEN_KEY = 'idToken';
      ACCESS_TOKEN_KEY = 'accessToken';
      authKeys = [ACCESS_TOKEN_KEY, ID_TOKEN_KEY];
      APP_HOST = 'https://app.prod.energycurb.com';
      API_ROOT = APP_HOST + '/api/public';
      AUTH_CLIENT_ID = 'hk5N2Ep8uxJcaxfeebd6nxcHQd5cFLHb',
      AUTH_DOMAIN = 'energycurb.auth0.com'

  var app = {
    init: function(){
      var self = this;
      this.lock = new Auth0Lock(AUTH_CLIENT_ID, AUTH_DOMAIN);
      if(!this.isLoggedIn()){
        if(!window.location.hash){
          this.lock.show();
        }
        this.lock.on('authenticated', function(authResult){
          authKeys.forEach(function(key){
            window.localStorage.setItem(key, authResult[key]);
          });
          self.initLoggedInState();
        });
      } else {
        this.initLoggedInState();
        this.fetchUser();
      }
    },
    initLoggedInState: function(){
      var self = this;
      this.initDOM();
      this.openLiveDataChannel();

      $.when(
        this.makeAPICall('/user'),
        this.makeAPICall('/locations')
      )
      .done(
        function(user, locations){
          self.user = user[0];
          self.allLocations = locations[0];
          self.renderUserInfo();
          self.selectLocation(self.allLocations[0].id);
        }
      );
    },

    openLiveDataChannel: function(){
      var self = this;
      $('.live-data ul').empty();
      if(io){
        if(this.socket){
          this.socket.destroy();
        }
        var socket = io(APP_HOST + '/circuit-data');
        socket.on('connect', function(){
          socket.emit('authenticate', {
            token: window.localStorage.getItem(ID_TOKEN_KEY)
          });
        });
        socket.on('authorized', function(){
          socket.emit('subscribe', self.locationId);
        })
        socket.on('data', this.renderLiveData);
        // try to reconnect when dropped
        socket.on('disconnect', this.openLiveDataChannel.bind(this))
        this.socket = socket;
      }
    },

    initDOM: function(){
      var self = this;
      $('.app').removeClass('hidden');
      $('.logout').click(function(e){
        e.preventDefault();
        self.logout();
      });

      $(document).on('click', '.location-selector', function(e, el){
        var locationId = $(e.currentTarget).attr('data-id');
        self.selectLocation(locationId);
      });
    },

    selectLocation: function(locationId){
      if(this.locationId !== locationId){
        this.locationId = locationId;
        this.renderForLocation();
      }
    },

    renderForLocation(){
      var currentLocation = this.getCurrentLocation();
      $('.app').toggleClass('production', currentLocation && currentLocation.hasProduction);
      this.openLiveDataChannel();
      this.renderLocations();
      this.renderHistorical();
      this.renderAggregate();
    },

    renderLiveData(data){
      var self = this,
          consumersList = $('.live-data .consumption ul'),
          producersList = $('.live-data .production ul'),
          consumingCircuits = data.circuits.filter(function(circuit){ return circuit.label && !circuit.main && !circuit.production }),
          producingCircuits = data.circuits.filter(function(circuit){ return circuit.label && !circuit.main && circuit.production });

      consumersList.empty();
      producersList.empty();

      var renderCircuit = function(circuit, container){
        container.append(
          $('<li>')
            .append(
              $('<span class="label">').text(circuit.label)
            )
            .append(
              $('<span class="wattage">').text(circuit.w + 'W')
            )
        );
      };

      consumingCircuits.forEach(function(circuit){
        renderCircuit(circuit, consumersList);
      });

      producingCircuits.forEach(function(circuit){
        renderCircuit(circuit, producersList);
      });
    },

    makeAPICall: function(endpoint){
      return $.ajax({
        url: API_ROOT + endpoint,
        headers: {
          'Authorization': 'Bearer ' + window.localStorage.getItem(ID_TOKEN_KEY)
        }
      });
    },

    fetchUser: function(){
      return this.makeAPICall('/user');
    },

    renderUserInfo: function(){
      $('.userinfo')
        .append(
          $('<img class="avatar">').attr({
            src: this.user.picture
          })
        )
        .append(
          $('<span>').text('Logged in as ' + this.user.email)
        );
    },

    renderHistorical: function(){
      var self = this,
          container = $('.time-series'),
          currentLocation = this.getCurrentLocation(),
          range = '3h',
          resolution = '5m',
          rangeSelector = container.find('select[name="historical-range"]'),
          resolutionSelector = container.find('select[name="historical-resolution"]'),
          button = container.find('button'),
          resultsContainer = container.find('.historical-results');

      var update = function(){
        range = rangeSelector.val();
        resolution = resolutionSelector.val();
        container.find('.url-historical-range').text(range);
        container.find('.url-historical-resolution').text(resolution);
      };
      var fetchData = function(){
        resultsContainer.html('Loading...');
        self.makeHistoricalCall(range, resolution)
          .done(function(data){
            resultsContainer.JSONView(data, {collapsed: true});
          });
      }

      container.find('.url-location-id').text(currentLocation.id);
      rangeSelector.add(resolutionSelector).on('change', update);
      button.off('click').on('click', function(e){
        e.preventDefault();
        fetchData();
      });
      update();
      fetchData();
    },

    renderAggregate: function(){
      var self = this,
          container = $('.aggregate'),
          currentLocation = this.getCurrentLocation(),
          range = '3h',
          resolution = '5m',
          rangeSelector = container.find('select[name="historical-range"]'),
          resolutionSelector = container.find('select[name="historical-resolution"]'),
          button = container.find('button'),
          resultsContainer = container.find('.historical-results');

      var update = function(){
        range = rangeSelector.val();
        resolution = resolutionSelector.val();
        container.find('.url-historical-range').text(range);
        container.find('.url-historical-resolution').text(resolution);
      };
      var fetchData = function(){
        resultsContainer.html('Loading...');
        self.makeAggregateCall(range, resolution)
          .done(function(data){
            resultsContainer.JSONView(data, {collapsed: true});
          });
      }

      container.find('.url-location-id').text(currentLocation.id);
      rangeSelector.add(resolutionSelector).on('change', update);
      button.off('click').on('click', function(e){
        e.preventDefault();
        fetchData();
      });
      update();
      fetchData();
    },

    makeHistoricalCall: function(range, resolution){
      return this.makeAPICall('/historical/' + this.locationId + '/' + range + '/' + resolution);
    },

    makeAggregateCall: function(range, resolution){
      return this.makeAPICall('/aggregate/' + this.locationId + '/' + range + '/' + resolution);
    },

    renderLocations: function(){
      var self = this,
          locationList = $('.locations ul');
          currentLocation = this.getCurrentLocation();
          currentLocationProfile = $('.locations .current-location');

      locationList.empty();
      this.allLocations.forEach(function(location){
        locationList.append(
          $('<li class="location-selector">').attr('data-id', location.id).toggleClass('active', self.locationId === location.id).text(location.name)
        );
      });

      currentLocationProfile.empty()
        .append(
          $('<div class="info">')
            .append(
              $('<span class="name">').text(currentLocation.name)
            )
            .append(
              $('<span class="address">').text(currentLocation.address + ' ' + currentLocation.postcode)
            )
        );
      if(currentLocation.geocode){
        currentLocationProfile
          .prepend(
            $('<img class="map">').attr(
              'src',
              'https://maps.googleapis.com/maps/api/staticmap?center=' + currentLocation.geocode +
              '&zoom=16&size=100x100' +
              '&markers=color:blue%7C' + currentLocation.geocode +
              '&key=AIzaSyB6KPLzuUx-TDTSJoCKZL2hSIF6Vqn564A'
            )
          );
      }

    },

    getCurrentLocation: function(){
      var self = this;
      return (this.allLocations || []).find(function(location){
        return location.id === self.locationId;
      });
    },

    isLoggedIn: function(){
      return !!window.localStorage.getItem(ID_TOKEN_KEY);
    },

    logout: function(){
      authKeys.forEach(function(key){
        window.localStorage.removeItem(key);
      });
      window.location.reload();
    }
  }

  app.init();

})();
