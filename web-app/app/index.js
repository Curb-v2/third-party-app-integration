const app = require('./app');
const config = require('./config');

require('./middleware');

app.listen(config.PORT);
