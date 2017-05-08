const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('../config');
const app = require('../app');
const session = require('express-session');


app.use(
  cookieParser()
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
app.use(
  express.static(config.STATIC_FILE_ROOT)
);

require('./authentication');
require('./routes');
