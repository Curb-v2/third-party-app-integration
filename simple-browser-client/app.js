(function(){
  var authKeys = ['accessToken', 'idToken'];
  var APIRoot = 'http://localhost:5050/api';

  var app = {
    init: function(){
      var lock = new Auth0Lock('hk5N2Ep8uxJcaxfeebd6nxcHQd5cFLHb', 'energycurb.auth0.com');
      this.initDOM();
      if(!this.isLoggedIn()){
        lock.show();

        lock.on('authenticated', function(authResult){
          authKeys.forEach(function(key){
            window.localStorage.setItem(key, authResult[key]);
          });
          // lock.getUserInfo(authResult.accessToken, function(err, profile) {
          //   if (err) {
          //     return;
          //   }
          //
          // });
        });
      } else {
        this.fetchUser();
      }
    },
    initDOM: function(){
      var self = this;
      $('.logout').click(function(e){
        e.preventDefault();
        self.logout();
      });
    },
    makeAPICall: function(endpoint){
      return $.ajax({
        url: APIRoot + endpoint,
        headers: {
          'Authorization': 'Bearer ' + window.localStorage.getItem('idToken')
        }
      });
    },
    fetchUser: function(){
      var self = this;
      this.makeAPICall('/state')
      .done(this.renderPage)
    },
    renderPage: function(data){
      $('.userinfo').append(
        $('<span>').text('Logged in as ' + data.user.email)
      );
    },
    isLoggedIn: function(){
      return !!window.localStorage.getItem('idToken');
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
