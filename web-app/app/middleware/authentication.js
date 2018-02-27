var path = require('path');
var qs = require('querystring');
var app = require('../app');
var authService = require('../services/authentication');
var config = require('../config');
var AUTH_COOKIE_NAME = 'auth_code';
var connectToLiveData = require('./live-data');

// login
app.get('/login', (req, res, next) => {
  res.redirect(
    `https://${config.AUTH_DOMAIN}/authorize?${qs.stringify(
      {
        audience: config.AUTH_AUDIENCE,
        scope: 'openid offline_access',
        response_type: 'code',
        client_id: config.AUTH_CLIENT_ID,
        redirect_uri: config.AUTH_REDIRECT_URI,
        state: {}
      }
    )}`
  );
});

// logout
app.get('/logout', (req, res, next) => {
  // destroy session and redirect to root
  req.session.destroy();
  res.redirect('/');
});

// code callback
app.get(`/${path.basename(config.AUTH_REDIRECT_URI)}`, (req, res, next) => {
  if(!req.query.code){
    return next(
      new Error('No Authorization code found')
    );
  }
  // store the authCode on the sessions
  req.session.authCode = req.query.code;
  authService.getTokenForAuthCode(req.session.authCode).then(
    accessToken => {
      // store the access code on the session
      req.session.accessToken = accessToken;
      // redirect to root
      res.redirect('/');
      // connect to live data (optional)
      connectToLiveData(accessToken);
    }
  )
});
