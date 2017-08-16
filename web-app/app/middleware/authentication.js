const path = require('path');
const qs = require('querystring');
const app = require('../app');
const authService = require('../services/authentication');
const config = require('../config');
const AUTH_COOKIE_NAME = 'auth_code';

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

app.get('/logout', (req, res, next) => {
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
  req.session.authCode = req.query.code;
  authService.getTokenForAuthCode(req.session.authCode).then(
    accessToken => {
      req.session.accessToken = accessToken;
      res.redirect('/');      
    }
  )
});
