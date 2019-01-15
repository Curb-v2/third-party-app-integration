var request = require('request');
var config = require('../config');
module.exports = {
  makeAPICall: function(accessToken, {method='GET', endpoint}){
    return new Promise(
      (resolve, reject) => {
        request(
          {
            method,
            url: `${config.API_ROOT}${endpoint}`,
            json: true,
            auth: {
              bearer: accessToken
            }
          },
          (err, res, body) => {

            err ? reject(err) : resolve(body)
          }
        )
      }
    );
  },
  getUser: function(accessToken){
    return this.makeAPICall(accessToken, {
      endpoint: '/user'
    });
  },
  getLocation: function(accessToken, locationId){
    return this.makeAPICall(accessToken, {
      endpoint: `/location/${locationId}`
    });
  },
  listLocations: function(accessToken){
    return this.makeAPICall(accessToken, {
      endpoint: '/location'
    });
  },
  getLatestSnapshot: function(accessToken, locationId){
    return this.makeAPICall(accessToken, {
      endpoint: `/latest/${locationId}`
    });
  }
}
