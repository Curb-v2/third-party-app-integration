const app = require('../app');
const config = require('../config');

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
  console.log(req.session);
  res.render('logged-in');
});
