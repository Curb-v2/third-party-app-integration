const express = require('express');
const config = require('../config')
const app = require('../app');

app.use(express.static(config.STATIC_FILE_ROOT));
