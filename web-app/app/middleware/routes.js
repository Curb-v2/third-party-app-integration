var app = require('../app');
var config = require('../config');
var apiService = require('../services/api');

// secure all downstream routes
app.use(
  (req, res, next) => {
    if(req.accepts('text/html')){
      // no auth code found, send user to login page
      if(!req.session.authCode && !req.url.match(/^\/login/)){
        return res.redirect('/login');
      }
    }
    next();
  }
);

//
app.get('/', (req, res, next) => {
  Promise.all([
    apiService.getUser(req.session.accessToken),
    apiService.listLocations(req.session.accessToken)
  ])
    .then(
      ([user, locations]) => {
        res.render('dashboard', {
          user,
          locations
        });
      }
    )
    .catch(next);
});

app.get('/location/:locationId', (req, res, next) => {
  var accessToken = req.session.accessToken;
  var locationId = req.params.locationId;
  Promise.all([
    apiService.getUser(accessToken),
    apiService.getLocation(accessToken, locationId),
    apiService.getLatestSnapshot(accessToken, locationId)
  ])
    .then(
      ([user, location, latest]) => {
        res.render('location-detail', {
          user,
          location,
          latest
        });
      }
    )
    .catch(next);
});
