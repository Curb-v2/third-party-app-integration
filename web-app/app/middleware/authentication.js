const path = require('path');
const qs = require('querystring');
const app = require('../app');
const authService = require('../services/authentication');
const config = require('../config');
const AUTH_COOKIE_NAME = 'auth_code';

var io = require('socket.io-client');
var connectToLiveData = function(token){
  // initialize connection
  var socket = io(`${config.API_ROOT}/circuit-data`);

  socket.on('connect', function(){
    // when the client is able to successfully connect, send an 'authenticate' event with the user's id token
    socket.emit('authenticate', {
      token: token
    });
  });
  socket.on('authorized', function(){
    console.log('did authorize');
    // the client has been successfully authenticated, and can now subscribe to one or more locations
    socket.emit('subscribe', '1c76f308-e1b6-4cae-abb8-34ba5c1dc5f9');
  });

  socket.on('subscriptionFailed', err => {
    console.error('error subscribing to location');
    console.error(err);
  });

  socket.on('data', function(data){
    console.log(data);
    // the client is receiving data for a specific location
    // data is a snapshot of the current state of all the circuits in a location
    // each circuit has a UUID, label, booleans that indicate whether they are mains circuits or production circuits, and a wattage value
    // data example:
    /*
      {
        locationId: <locationId>,
        circuits: [
          {
            id: <UUID>,
            label: '',
            main: true,
            production: false,
            w: 1200
          },
          {
            id: <UUID>,
            label: 'Refrigerator',
            main: false,
            production: false,
            w: 100
          },
          {
            id: <UUID>,
            label: 'Solar',
            main: false,
            production: true,
            w: -500
          }
          ...
        ]
      }
    */
  });

  socket.on('error', err => {
    console.error('error');
    console.error(err);
  })

  // if the connection drops, try to reconnect
  socket.on('disconnect', (err) => {
    console.log('reconnecting');
    connectToLiveData(token);
  });
  return socket;
};


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
      connectToLiveData(accessToken);
      res.redirect('/');
    }
  )
});
