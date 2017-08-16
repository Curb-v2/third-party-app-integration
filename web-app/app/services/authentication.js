const request = require('request');
const config = require('../config');

module.exports = {
  getTokenForAuthCode: authCode => {
    return new Promise(
      (resolve, reject) => {
        request(
          {
            method: 'POST',
            url: `https://${config.AUTH_DOMAIN}/oauth/token`,
            json: true,
            body: {
              grant_type: 'authorization_code',
              client_id: config.AUTH_CLIENT_ID,
              client_secret: config.AUTH_CLIENT_SECRET,
              code: authCode,
              redirect_uri: config.AUTH_REDIRECT_URI
            }
          },
          (err, res, body) => {
            if(err){
              return reject(err);
            }
            return resolve(body.access_token);
          }
        );
      }
    );
  }
}
