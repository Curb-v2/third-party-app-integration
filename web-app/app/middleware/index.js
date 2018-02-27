var express = require('express');
var cookieParser = require('cookie-parser');
var config = require('../config');
var app = require('../app');
var session = require('express-session');

app.use(
  cookieParser(
    config.COOKIE_SIGNING_SECRET
  )
);

// sessions
app.use(
  session(
    {
      secret: config.COOKIE_SIGNING_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30
      }
    }
  )
);

// serve static files
// app.use(
//   express.static(config.STATIC_FILE_ROOT)
// );

require('./authentication');
require('./routes');
