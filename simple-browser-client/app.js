(function(){
  var ID_TOKEN_KEY = 'idToken';
      ACCESS_TOKEN_KEY = 'accessToken';
      authKeys = [ACCESS_TOKEN_KEY, ID_TOKEN_KEY];
      APP_HOST = 'http://localhost:3000';
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
          self.selectLocation(self.allLocations[0].id);
        }
      );
    },

    openLiveDataChannel: function(){
      var self = this;
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
    },

    selectLocation: function(locationId){
      if(this.locationId !== locationId){
        this.locationId = locationId;
        this.renderForLocation();
      }
    },

    renderForLocation(){
      this.openLiveDataChannel();
      this.renderUserInfo();
      this.renderLocations();
      // render more stuff
    },

    renderLiveData(data){
      var self = this,
          circuitsList = $('.live-data ul');

      circuitsList.empty();

      data.circuits
        .filter(function(circuit){
          return circuit.label && !circuit.main
        })
        .forEach(function(circuit){
          circuitsList.append(
            $('<li>')
              .toggleClass('production', circuit.production)
              .append(
                $('<span class="label">').text(circuit.label)
              )
              .append(
                $('<span class="wattage">').text(circuit.w + 'W')
              )
          );
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

    renderLocations: function(){
      var self = this,
          locationList = $('.locations ul');

      locationList.empty();
      this.allLocations.forEach(function(location){
        locationList.append(
          $('<li class="location-selector">').attr('data-id', location.id).toggleClass('active', self.locationId === location.id).text(location.name)
        );
      })
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
