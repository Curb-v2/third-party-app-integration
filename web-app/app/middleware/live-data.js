var io = require('socket.io-client');
var API = require('../services/api');
var config = require('../config');

var connectToLiveData = function(token){
  // initialize connection
  var socket = io(`${config.API_ROOT}/circuit-data`, {
    transports: ['websocket']
  });

  socket.on('connect', function(){
    // when the client is able to successfully connect, send an 'authenticate' event with the user's id token
    socket.emit('authenticate', {
      token: token
    });
  });



  socket.on('authorized', function(){
    // the client has been successfully authenticated, and can now subscribe to one or more locations
    // call the API to get their locations and subscribe them to the first one
    API.listLocations(token)
      .then(
        function(locations){
          if(locations && locations.length){
            socket.emit('subscribe', locations[0].id);
          }
        }
      )
  });

  socket.on('subscriptionFailed', err => {
    console.error('error subscribing to location');
    console.error(err);
  });

  socket.on('data', function(data){
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

module.exports = connectToLiveData;
