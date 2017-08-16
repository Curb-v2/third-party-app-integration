const app = require('../app');
const config = require('../config');
const apiService = require('../services/api');

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
    apiService.getLocations(req.session.accessToken)
  ])
    .then(
      ([user, locations]) => {
        res.render('logged-in', {
          user,
          locations
        });
      }
    )
    .catch(next);
});
