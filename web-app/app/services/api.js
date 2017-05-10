const request = require('request');
const config = require('../config');
module.exports = {
  makeAPICall: function(accessToken, {method='GET', endpoint}){
    return new Promise(
      (resolve, reject) => {
        console.log(accessToken);
        request(
          {
            method,
            url: `${config.API_ROOT}${endpoint}`,
            json: true,
            auth: {
              bearer: accessToken
            }
          },
          (err, res, body) => err ? reject(err) : resolve(body)
        )
      }
    );
  },
  getUser: function(accessToken){
    return this.makeAPICall(accessToken, {
      endpoint: '/user'
    });
  },
  getLocations: function(accessToken){
    return this.makeAPICall(accessToken, {
      endpoint: '/locations'
    })
  }
}
