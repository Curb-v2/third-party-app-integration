## Curb Public API
### Authentication
There are several different OAuth flows that we support.  For simplicity, here is an example of the Authorization Code Grant flow that would be used for a traditional web app.

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
	"client_id": "YOUR_CLIENT_ID",
	"client_secret": "YOUR_CLIENT_SECRET",
	"code": "AUTHORIZATION_CODE",
	"redirect_uri": "http://yourapp.com/token"
}'
```
Again, you will replace `YOUR_CLIENT_ID` and `YOUR_CLIENT_SECRET` with your client credentials.  `AUTHORIZATION_CODE` is your authorization code from the previous step.  `redirect_uri` must also be on your redirect url whitelist.  The above request will return a JSON response.  You can capture the `access_token` key from the response, and store that with the user's session.  The access token is a [JSON Web Token](https://jwt.io/), and you will use this token to call the Curb API on behalf of your user.

3. __Call the Curb API with your user's access token__: Once you have an access token for your user, you use it as the `Authorization` header for all of your requests to the Curb API.  Eg:
```
curl -X GET \
  https://app.energycurb.com/api/user \
  -H 'authorization: Bearer {{ACCESS_TOKEN}}' \
```
Replace `{{ACCESS_TOKEN}}` with your access token obtained above.

### Endpoints

#### User
* __GET__ `/api/user` - Get the user's profile:
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
* __PATCH__ `/api/user` - Modify the users `user_metadata` object.
  * The request body is a JSON object that will be merged into the existing `user_metadata` object.  If you want to remove a key from `user_metadata`, you explicitly set it to `null`. The below request body will add a key of `foo: bar` and remove the `boom`.
  ```json
  {
    "foo": "bar",
    "boom": null
  }
  ```

#### Location
* __GET__ `/api/locations` - Get all of the users's locations. *Disclaimer: "extra_data" is an optional JSON field. There is no guarantee that it will be populated, and the key-value pairs are not validated for content. They will hold any data an api client provides*

  * Response:
  ```json
  [
      {
          "extra_data": {},
          "address": "1524 S IH 35",
          "country": "USA",
          "geocode": "30.24306,-97.73605500000001",
          "name": "CURB Office",
          "id": "3a57c9dc-e732-4f71-9aff-bb7128f7583b",
          "postcode": "78704",
          "hasProduction": true
      },
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

* __GET__ `/api/locations/:locationId` - Get a location by id
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

#### Historical
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

* __GET__ `/api/historical/:locationId/:rangeId/:resolution` - Get historical data for all circuits in the given locationId, rangeId, and resolution.  Response will be a JSON array, with one item for each circuit, and each circuit contains a `values` array with averaged samples that have a timestamp and a value in Watt-hours.
  * Example response for `/api/historical/locationId/5m/m`:
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
  * Example response for `/api/aggregate/locationId/5m/m`:
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

#### Latest  
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
