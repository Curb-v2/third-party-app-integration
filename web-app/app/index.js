var app = require('./app');
var config = require('./config');
var path = require('path');

// set up views
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.engine('pug', require('pug').__express);

require('./middleware');

app.listen(config.PORT, () => console.log(`App is listening on port ${config.PORT}`));
