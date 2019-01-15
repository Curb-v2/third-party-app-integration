# Curb Public API

## Authorization
Our API supports Oauth 2.0.  To find out more about Oauth 2.0 and figure out which flow you should use, [read this guide](https://auth0.com/docs/api-auth/which-oauth-flow-to-use).

Feel free to run our [simple-browser-client](https://github.com/Curb-v2/third-party-app-integration/tree/master/simple-browser-client) which uses the Implicit Grant flow to fetch data from our API.

The end goal of any auth flow is to obtain an `access_token`, which is what the Curb API uses to validate requests.  Our public API is user scoped, meaning you have to log in as an end-user, that the user's identity is encoded into the `access_token`, and only data associated with that user is available.  Once you have an access token, you can use it to make API calls on behalf of the end user:
```
curl -X GET \
  https://app.energycurb.com/api/v3/user \
  -H 'authorization: Bearer {{ACCESS_TOKEN}}' \
```
Replace `{{ACCESS_TOKEN}}` with your access token.

### Obtaining client credentials
We provide an example pair of client credentials that you can use to get up and running with our API quickly and easily.

__Client ID__: iKAoRkr3qyFSnJSr3bodZRZZ6Hm3GqC3<br />
__Client Secret__: dSoqbfwujF72a1DhwmjnqP4VAiBTqFt3WLLUtnpGDmCf6_CMQms3WEy8DxCQR3KY

These are only for development or ad-hoc requests.  These credentials are periodically revoked and regenerated, so don't expect them to last forever.  You can always come back to this document to get the latest client credentials.

If you are a Curb end user and simply want to use the API to fetch more data for your Curb installation, you can use the example client credentials along with the [simplified ad-hoc authentication scheme described here](#ad-hoc-authentication-for-a-single-user).

__If you are planning on using the Curb API to build a public-facing application, do not use the above example client credentials__.  If you are building a public-facing app, or want credentials that you know won't be revoked, you will need to be set up as an authorization client within our system.  This is quick and easy to do, just email [support@energycurb.com](mailto:support@energycurb.com) asking to be set up as a client, and we will send you your client credentials.

### Authorization code grant flow (traditional web app)

There are several different OAuth flows that we support.  Here is an example of the Authorization Code Grant flow that would be used for a traditional web app.

1. __Get an authorization code__: You can direct your users to the following URL, which hosts a a login form allowing them to enter their username and password.
```
https://energycurb.auth0.com/authorize?audience=app.energycurb.com/api&scope=openid&response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://yourapp.com/authorization_code
```
Note that you will need to replace `YOUR_CLIENT_ID` with your client id.  Also, the value used for `redirect_uri` will need to be on your whitelist of allowed redirect urls.  When your user successfully signs in with the above form, they will be redirect to `http://yourapp.com/authorization_code?code=AUTHORIZATION_CODE`.  Your app will then capture that authorization code which it will use to obtain an access token for your user.

2. __Get an access token for the authorization code__: Using authorization code you received from the above step to get an access token, which you can do via the `/oauth/token` endpoint.
```
curl -X POST \
  https://energycurb.auth0.com/oauth/token \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
	"grant_type": "authorization_code",
	"client_id": "{{YOUR_CLIENT_ID}}",
	"client_secret": "{{YOUR_CLIENT_SECRET}}",
	"code": "{{AUTHORIZATION_CODE}}",
	"redirect_uri": "http://yourapp.com/token"
}'
```
Again, you will replace `YOUR_CLIENT_ID` and `YOUR_CLIENT_SECRET` with your client credentials.  `AUTHORIZATION_CODE` is your authorization code from the previous step.  `redirect_uri` must also be on your redirect url whitelist in your auth client settings (if it is not, contact us to add it).  The above request will return a JSON response.  You can capture the `access_token` key from the response, and store that with the user's session.  The access token is a [JSON Web Token](https://jwt.io/), and you will use this token to call the Curb API on behalf of your user.

3. __Call the Curb API with your user's access token__: Once you have an access token for your user, you use it as the `Authorization` header for all of your requests to the Curb API.  Eg:
```
curl -X GET \
  https://app.energycurb.com/api/v3/user \
  -H 'authorization: Bearer {{ACCESS_TOKEN}}' \
```
Replace `{{ACCESS_TOKEN}}` with your access token obtained above.

### Ad-hoc authentication for a single user
If you are only interested in consuming the API for single user (eg. if you are a Curb user and want to fetch more data using your username and password), there is a simplified flow that does not require the authorization code step above.  You will instead just request an access token directly via:

```
curl -X POST \
  https://energycurb.auth0.com/oauth/token \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{
	"grant_type": "password",
	"audience": "app.energycurb.com/api",
	"username": "{{USER_EMAIL}}",
	"password": "{{USER_PASSWORD}}",
	"client_id": "{{YOUR_CLIENT_ID}}",
	"client_secret": "{{YOUR_CLIENT_SECRET}}"
}'

```

This will return a JSON structure with an `access_token` value that is used to call the API in the same way as step 3 above.

__This requires a password grant type, which is not enabled for new clients by default__ - if you plan on using this authentication strategy, please contact Curb support at support@energycurb.com to enable this grant type.

## Endpoints

### User
* __GET__ `/api/v3/user` - Get the user's profile:
  * Response:
  ```json
  {
      "email": "cody@energycurb.com",
      "name": "Cody",
      "email_verified": true,
      "user_id": "auth0|58af3e66c7b75a07750f61cc",
      "nickname": "cody",
      "updated_at": "2017-08-16T19:07:14.093Z",
      "created_at": "2017-02-23T19:56:22.820Z",
      "logins_count": 319
  }
  ```
* __PATCH__ `/api/v3/user` - Modify the users `user_metadata` object.
  * The request body is a JSON object that will be merged into the existing `user_metadata` object.  If you want to remove a key from `user_metadata`, you explicitly set it to `null`. The below request body will add a key of `foo: bar` and remove the `boom`.
  ```json
  {
    "foo": "bar",
    "boom": null
  }
  ```

### Location
* __GET__ `/api/v3/locations` - Get all of the users's locations. *Disclaimer: "extra_data" is an optional JSON field. There is no guarantee that it will be populated, and the key-value pairs are not validated for content. They will hold any data an api client provides*

  * Response:
  ```json
  [
      {
          "extra_data": {
              "billing": {
                  "kwhPrice": 0.1,
                  "currency": {
                      "code": "USD",
                      "name_plural": "US dollars",
                      "decimal_digits": 2,
                      "symbol_native": "$",
                      "symbol": "$",
                      "rounding": 0,
                      "name": "US Dollar"
                  },
                  "type": "simple",
                  "zipCode": "78704",
                  "utilityProviderId": null,
                  "dayOfMonth": 1
              },
              "timezone": {
                  "rawOffset": -21600,
                  "dstOffset": 3600,
                  "status": "OK",
                  "timeZoneName": "Central Daylight Time",
                  "data": [],
                  "timeZoneId": "America/Chicago"
              }
          },
          "address": "1524 S IH 35",
          "country": "USA",
          "geocode": "30.24306,-97.73605500000001",
          "name": "CURB Office",
          "id": "3a57c9dc-e732-4f71-9aff-bb7128f7583b",
          "postcode": "78704",
          "hasProduction": true
      },
      {
          "extra_data": {
              "billing": {
                  "kwhPrice": 0.018,
                  "currency": {
                      "code": "USD",
                      "name_plural": "US dollars",
                      "decimal_digits": 2,
                      "symbol_native": "$",
                      "symbol": "$",
                      "rounding": 0,
                      "name": "US Dollar"
                  },
                  "type": "utility",
                  "zipCode": "78704",
                  "utilityProviderId": "539fcac1ec4f024d2f53fef2",
                  "dayOfMonth": 1
              },
              "timezone": {
                  "timeZoneName": "Central Daylight Time",
                  "rawOffset": -21600,
                  "timeZoneId": "America/Chicago",
                  "status": "OK",
                  "dstOffset": 3600
              }
          },
          "address": "2611 S 5th St",
          "country": "USA",
          "geocode": "30.2399664,-97.7658567",
          "name": "Cody's house",
          "id": "b07bb3af-f69c-4bf2-8bb0-674469224fab",
          "postcode": "78704",
          "hasProduction": false
      }
  ]  
  ```

* __GET__ `/api/v3/locations/:locationId` - Get a location by id
  * Response:
  ```json
  [
      {
          "address": "2611 S 5th St",
          "country": "USA",
          "geocode": "30.2399664,-97.7658567",
          "name": "Cody's house",
          "id": "b07bb3af-f69c-4bf2-8bb0-674469224fab",
          "postcode": "78704",
          "hasProduction": false
      }
  ]  
  ```

* __GET__ `/api/locations/:locationId/metadata` - Get location metadata for a location by id.  This includes flags indicating whether or not the location has configured mains, batteries, or prodution.  It also indicates how many hub installations are presnt, as well as some data about messages/alerts that have been received by this location.
  * Response:
  ```json
  {
    "mains": true,
    "battery": false,
    "production": true,
    "installations_count": 2,
    "dt_claimed": "2017-07-13T19:00:00.000Z",
    "connection_health": 1,
    "message_count": 28,
    "unread_count": 0
   }
   ```

* __GET__ `/api/locations/:locationId/installations` - Get a list of the hub installations present at the location.
  * Response:
  ```json
  [
     {
	"hub": "cbas9lkr",
	"dt_created": "2018-02-06T22:14:03.022571Z",
	"dt_modified": "2018-05-07T19:23:46.688679Z",
	"organization": "curb",
	"label": "Outdoor Hub",
	"provider": "curb",
	"dt_claimed": "2017-07-13T19:00:00Z",
	"panel_type": 0,
	"location": "59fbc0d5-dc2b-416a-aa98-d6f302df7c7a"
     },
     {
	"hub": "c0kw1n3y",
	"dt_created": "2018-02-06T22:12:34.019563Z",
	"dt_modified": "2018-05-07T19:30:51.948902Z",
	"organization": "curb",
	"label": "Pantry Hub",
	"provider": "curb",
	"dt_claimed": "2017-07-13T19:00:00Z",
	"panel_type": 2,
	"location": "59fbc0d5-dc2b-416a-aa98-d6f302df7c7a"
     }
  ]
  ```

### Historical
__Range time units__

Unit | Value | | | Resolution unit | Value
--- | --- | --- | --- | --- | ---
__s__ | seconds | | | __s__ | seconds
__m__ | minutes | | | __m__ | minutes
__h__ | hours | | | __5m__ | 5 minutes
__d__ | days | | | __h__ | hours
__w__ | weeks
__mo__ | months
__y__ | years

The __`rangeId`__ parameter is a string representing the amount of time back from the present moment that you would like to query.  It must contain a magnitude and a unit value.  For example, to query the last 30 seconds, your rangeId would be `30s`.  To query the last 6 weeks, the rangeId would be `6w`.

The __`resolution`__ parameter specifies what level of data resolution you would like for you response.  Note that large ranges and smaller resolutions will result in slower requests.  `s`, `m`, `5m`, and `h` are the only allowed resolution values.

* __GET__ `/api/v3/historical/:locationId/:rangeId/:resolution` - Get historical data for all circuits in the given locationId, rangeId, and resolution.  Response will be a JSON array, with one item for each circuit, and each circuit contains a `values` array with averaged samples that have a timestamp and a value in Watt-hours.
  * Example response for `/api/v3/historical/locationId/5m/m`:
  ```js
  [
      {
          "label": "",
          "id": "cd22e9ed-b0a1-43c6-9b42-1b518a68c2c3",
          "main": true,
          "values": [
              {
                  "t": 1502910420,
                  "w": 716
              },
              {
                  "t": 1502910480,
                  "w": 715
              },
              {
                  "t": 1502910540,
                  "w": 714
              },
              {
                  "t": 1502910600,
                  "w": 714
              },
              {
                  "t": 1502910660,
                  "w": 714
              }
          ]
      },
      {
          "label": "Washer + garage/outdoor plugs",
          "id": "abaec9cf-b629-4f76-b867-f9507df9eb7c",
          "values": [
              {
                  "t": 1502910420,
                  "w": 0
              },
              {
                  "t": 1502910480,
                  "w": 0
              },
              {
                  "t": 1502910540,
                  "w": 0
              },
              {
                  "t": 1502910600,
                  "w": 0
              },
              {
                  "t": 1502910660,
                  "w": 0
              }
          ]
      },
      {
          "label": "A/C",
          "id": "17398293-abfe-44cc-9bfb-8dbc65c10c04",
          "values": [
              {
                  "t": 1502910420,
                  "w": 114
              },
              {
                  "t": 1502910480,
                  "w": 114
              },
              {
                  "t": 1502910540,
                  "w": 114
              },
              {
                  "t": 1502910600,
                  "w": 114
              },
              {
                  "t": 1502910660,
                  "w": 114
              }
          ]
      },
      // ... more circuits
      {
          "label": "Other",
          "id": "__OTHER__",
          "other": true,
          "values": [
              {
                  "t": 1502910420,
                  "w": 9
              },
              {
                  "t": 1502910480,
                  "w": 10
              },
              {
                  "t": 1502910540,
                  "w": 10
              },
              {
                  "t": 1502910600,
                  "w": 9
              },
              {
                  "t": 1502910660,
                  "w": 10
              }
          ]
      }
  ]  
  ```
* __GET__ `/aggregate/:locationId/:rangeId/:resolution` - Get the aggregate snapshot for each circuits for the given locationId, rangeId, and resolution.  Response will be a JSON array, with one item for each circuit.  The aggregate snapshot contains these additional values `min`, `max`, `avg`, `sum`, and `kwhr`.
  * Example response for `/api/v3/aggregate/locationId/5m/m`:
  ```js
  [
      {
          "sum": 10694,
          "avg": 2674,
          "min": 2668,
          "max": 2676,
          "kwhr": 0.22279295446884,
          "label": "",
          "main": true,
          "production": false,
          "id": "cd22e9ed-b0a1-43c6-9b42-1b518a68c2c3"
      },
      {
          "sum": 0,
          "avg": 0,
          "min": 0,
          "max": 0,
          "kwhr": 0.00019689275976000003,
          "label": "Washer + garage/outdoor plugs",
          "main": false,
          "production": false,
          "id": "abaec9cf-b629-4f76-b867-f9507df9eb7c"
      },
      {
          "sum": 8409,
          "avg": 2102,
          "min": 2105,
          "max": 2098,
          "kwhr": 0.17518174029485997,
          "label": "A/C",
          "main": false,
          "production": false,
          "id": "17398293-abfe-44cc-9bfb-8dbc65c10c04"
      },
      {
          "sum": 444,
          "avg": 111,
          "min": 111,
          "max": 111,
          "kwhr": 0.00925799439642,
          "label": "Bedrooms + office",
          "main": false,
          "production": false,
          "id": "2d77be2b-522d-45c6-874d-44c4075eef77"
      },
      // .. more circuits
      {
          "id": "__OTHER__",
          "label": "Other",
          "main": false,
          "production": false,
          "other": true,
          "avg": 29,
          "kwhr": 0.0022584195219750303
      }
  ]  
  ```

### Latest  
* __GET__ `/latest/:locationId` - Get the latest second sample snapshot of all circuits, plus the consumption, production, and net values
```js
{
    "timestamp": 1502917051,
    "locationId": "b07bb3af-f69c-4bf2-8bb0-674469224fab",
    "consumption": 3009,
    "production": 0,
    "net": 3009,
    "circuits": [
        {
            "w": 0,
            "id": "1e144243-1a3a-4bc7-a370-43fddaba0285",
            "label": "Garage door / light",
            "main": false,
            "production": false
        },
        {
            "w": 2069,
            "id": "17398293-abfe-44cc-9bfb-8dbc65c10c04",
            "label": "A/C",
            "main": false,
            "production": false
        },
        {
            "w": 397,
            "id": "a62e0383-81d0-4494-9c25-4dac60b48506",
            "label": "Blower / furnace",
            "main": false,
            "production": false
        },
        {
            "w": 0,
            "id": "686bf1a8-96f8-45c0-b84b-2b12ea6c80f3",
            "label": "Kitchen / bathroom / hallway",
            "main": false,
            "production": false
        },
        {
            "w": 0,
            "id": "d0142c8a-78d4-4c0b-84ab-440a6f09601c",
            "label": "Refrigerator",
            "main": false,
            "production": false
        },
        {
            "w": 54,
            "id": "2d77be2b-522d-45c6-874d-44c4075eef77",
            "label": "Bedrooms + office",
            "main": false,
            "production": false
        },
        // ... more circuits
        {
            "id": "__OTHER__",
            "label": "Other",
            "main": false,
            "production": false,
            "other": true,
            "w": 35
        }
    ]
}
```

## Real-time data

Curb exposes a websocket-based API for real-time circuit data.  The data is identical to the `circuits` key on the [`/latest` endpoint described above](#latest).  Curbs send new data approximately once per second.

### How to use

The Curb real-time data API is powered by [socket.io](https://socket.io/), a management layer built on top of websockets.  Socket.io has a companion client library [socket.io-client](https://github.com/socketio/socket.io-client) which simplifies communicating with a socket.io server.

If you wish to consume Curb's real-time data API, __it is strongly recommended that you use socket.io-client__.  It automatically handles handshaking, reconnecting, and serializing and parsing messages to and from the server.  There are official libraries for [JavaScript](https://github.com/socketio/socket.io-client), [Swift](https://github.com/socketio/socket.io-client-swift), [Java](https://github.com/socketio/socket.io-client-java), and [C++](https://github.com/socketio/socket.io-client-cpp),  You can still connect to the API with vanilla websockets, but it is much easier to use a client library.  Code examples for both options are below.

Conceptually, here are the steps that you must take to begin consuming Curb live data:

1. Connect to the socket.io server.
2. Once connected, emit an `authenticate` event with your access token (the same access token used to access the REST endpoints described above).
3. Once the server responds with an `authorized` event, a client can then emit a `subscribe` event for a location ID.
4. The server will push JSON payloads for the subscribed location IDs.

#### socket.io-client example
The below code is taken from our [simple-browser-client example](https://github.com/Curb-v2/third-party-app-integration/blob/master/simple-browser-client/app.js) in this repo:
```js
import io from 'socket.io-client';

const connectToLiveData = function(){
  const socket = io('https://app.energycurb.com/api/circuit-data', { transports: ['websocket'] });
  // connect
  socket.on('connect', function(){
    // once connected authenticate with
    socket.emit('authenticate', {
      token: USER_ACCESS_TOKEN
    });
  });

  // once authorized, subscribe to location by id
  socket.on('authorized', function(){
    socket.emit('subscribe', LOCATION_ID);
    // socket can subscribe to more locations if needed
  })

  // try to reconnect when dropped
  socket.on('disconnect', connectToLiveData);

  // log errors
  socket.on('error', console.error);

  // receive data pushed from server
  socket.on('data', function(data){
    // do something with data here
    /*
    data = {
    	"locationId": "59fbc0d5-dc2b-416a-aa98-d6f302df7c7a",
    	"circuits": [{
    		"w": 745,
    		"id": "15b70e34-a3ad-464f-85f8-549af070cf1f",
    		"label": "Dining, Hall (1F), Bath (1F)",
    		"grid": false,
    		"main": false,
    		"battery": false,
    		"production": false,
    		"circuit_type": "consumption"
    	}, {
    		"w": 241,
    		"id": "4cb9e781-8570-4e52-b199-0dd297cc24b0",
    		"label": "Library / Hall",
    		"grid": false,
    		"main": false,
    		"battery": false,
    		"production": false,
    		"circuit_type": "consumption"
    	}, {
    		"w": 15,
    		"id": "bd6700d4-9b58-43f7-95d7-20f3d927ce4c",
    		"label": "Master (2F), Outdoor Lights",
    		"grid": false,
    		"main": false,
    		"battery": false,
    		"production": false,
    		"circuit_type": "consumption"
    	}, {
    		"w": -91,
    		"id": "071ec949-d0a6-4129-b2ab-827c6e023f91",
    		"label": "Solar (South)",
    		"grid": true,
    		"main": false,
    		"battery": false,
    		"production": true,
    		"circuit_type": "line_side_production"
    	},
      ... more circuits
      ]
    }
    */
  });  
}

connectToLiveData();

```
#### Vanilla websockets example
This is much more complex than using a socket.io-client library.  Note that the URL is different, and the namespace must be joined separately.  Socket.io uses protocol codes which must be prepended to each message.  It also expects a message with both an event name and a payload, which must be serialized into the message string sent over the websocket channel.  You can avoid all of this complexity by just using the socket.io-client library ;)
```js
const websocket = new WebSocket('wss://app.energycurb.com/socket.io/?EIO=3&transport=websocket');
const namespace = '/api/circuit-data';

const authenticate = function(){
  websocket.send(
    serializeOutgoing({
      event: 'authenticate',
      payload: {
        token: USER_ACCESS_TOKEN
      }
    })
  );
}

const serializeOutgoing = function(message){
  // the 42 prefix is a protocol code for a message
  return `42${namespace},${JSON.stringify([message.event,message.payload])}`
}

const parseIncoming = function(s){
  try {
    const splitIndex = s.indexOf(',');
    const message = JSON.parse(s.substr(splitIndex + 1));
    return {
      event: message[0],
      payload: message[1]
    };
  }
  catch(err){
    console.error(`Failed to parse incoming message ${err}`);
    return s;
  }
}

websocket.onopen = function(e) {
  // bind to the /api/circuit-data namespace
  // the 40 prefix is a protocol code for joining a namespace
  websocket.send('40/api/circuit-data');
  // wait for one second for socket to join namespace before authenticating
  setTimeout(
    authenticate,
    1000
  );
};

websocket.onmessage = function(message) {
  const { event, payload } = parseIncoming(message.data);
  switch(event){
    case 'authorized':
      websocket.send(
        serializeOutgoing({
          event: 'subscribe',
          payload: LOCATION_ID
        })
      );
      // additional locations may be subscribed to here
    case 'data':
      // RECEIVED payload, do something with payload here
      /*
      payload = {
      	"locationId": "59fbc0d5-dc2b-416a-aa98-d6f302df7c7a",
      	"circuits": [{
      		"w": 745,
      		"id": "15b70e34-a3ad-464f-85f8-549af070cf1f",
      		"label": "Dining, Hall (1F), Bath (1F)",
      		"grid": false,
      		"main": false,
      		"battery": false,
      		"production": false,
      		"circuit_type": "consumption"
      	}, {
      		"w": 241,
      		"id": "4cb9e781-8570-4e52-b199-0dd297cc24b0",
      		"label": "Library / Hall",
      		"grid": false,
      		"main": false,
      		"battery": false,
      		"production": false,
      		"circuit_type": "consumption"
      	}, {
      		"w": 15,
      		"id": "bd6700d4-9b58-43f7-95d7-20f3d927ce4c",
      		"label": "Master (2F), Outdoor Lights",
      		"grid": false,
      		"main": false,
      		"battery": false,
      		"production": false,
      		"circuit_type": "consumption"
      	}, {
      		"w": -91,
      		"id": "071ec949-d0a6-4129-b2ab-827c6e023f91",
      		"label": "Solar (South)",
      		"grid": true,
      		"main": false,
      		"battery": false,
      		"production": true,
      		"circuit_type": "line_side_production"
      	},
        ... more circuits
        ]
      }
      */
  }
};

websocket.onerror = console.error;

```
