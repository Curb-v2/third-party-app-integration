# Fleet API documentation

This API provides a series of endpoints to view/manage the status of a Curb fleet.

## Authentication
To use the Fleet API, you must request an API token from our OAuth 2.0 authentication service with your client ID and client secret (which should be provided by Curb).  Here is how to execute that client credentials request:

```bash
curl -X POST \
  https://energycurb.auth0.com/oauth/token \
  -H 'Content-Type: application/json' \
  -d '{
  "client_id": "<CLIENT_ID>",
  "client_secret": "<CLIENT_SECRET>",
  "audience": "fleet.prod.energycurb.com",
  "grant_type": "client_credentials"
}'
```

If successful, this will return something like the following JSON response:

```json
{
    "access_token": "<access_token>",
    "scope": "api:curb",
    "expires_in": 86400,
    "token_type": "Bearer"
}
```

The `access_token` above is a JSON web token that is used to authenticate all requests to the Fleet API.  The access token is used as a Bearer token to populate the authorization request header.  Here is an example of how to use it:

```bash
curl -X GET \
  https://admin.energycurb.com/api/ping \
  -H 'authorization: Bearer <access_token>' \
```

Access tokens expire after 24 hours.  If you try to use your token beyond 24 hours, the Fleet API will respond with a 401 error, at which point you will need to execute the client credentials request again in order to get a new token.

## Using the API
The Fleet API root is __`https://admin.energycurb.com/api`__.  

### What is a fleet?
Every request is scoped to a fleet, which is a subset of Curb hubs and locations to which your client organization has access.  Curb hubs should be marked as belonging to a fleet when they are purchased by the fleet organization.  

The first route parameter of every request is `<fleet>` identifer, which indicates which fleet you are trying to access.  The fleet identifier is transparent and human-readable.  A client organization may have access to more than one fleet.

### Querying
Any request that returns a paginated list is filterable based on the model data of the returned object.  For example, when listing locations, you could query for locations that are in Austin by using `?city=Austin` as a query parameter on the request.  You can also query for null or not null values by using the `__isnull` modifier.  So if you would like to query for installations whose `location` field is null, you can use `?location__isnull=1` to return only those with null locations, or use `?location__isnull=0` to return only those with non-null locations.

Other than `__isnull`, here are some other common query parameter filters you can use:

* __`__icontains`__ - does a case insensitive search for a substring in a property
  * eg. `name__icontains=foo` - returns objects whose `label` property is a contains the string "foo"
* __`__in`__ - checks to see if a value is one of a list of possible values
  * eg. `state__in=TX,AZ` - returns all objects whose `state` property is any one of `['TX', 'AZ']`.
* __`__ne`__ - checks if a value does not equal the queried value
  * eg. `city__ne=Phoenix` - returns all objects whose `city` property does not equal "Phoenix".  
* __`__gt`__, __`__lt`__, __`__gte`__, __`__lte`__ - numerical comparison filters.  Useful when filtering by date or other quantitative data.
  * eg. `dt_created__gt=2020-08-30T20:10:13.853850Z` - returns all values created since that date

By default, this API will only return data belonging to the fleet indicated by the `<fleet>` identifier in the URL.  If that fleet is a parent organization that has subfleets organized underneath it, you can always add `include_all_subfleets=1` query parameter to any API calls to return data that includes all of the subfleets' data as well.

# Endpoints

## Querying across an entire fleet

### `/api/<fleet>/location`
* Returns a paginated list of all locations in a fleet
* __Query parameters__ - See [Querying](#querying) above.  Common queries include:
    * `city=Chicago`
    * `installation__hub=<hub_serial>`
* Response schema:
```json
{
    "count": 166,
    "next": "/api/curb/location?page=2",
    "previous": null,
    "results": [
        {
            "id": "4d6874eb-2499-41dc-88ce-2dc570099f5e",
            "dt_created": "2020-06-23T23:26:26.581017Z",
            "dt_modified": "2020-06-23T23:27:05.696942Z",
            "organization": "curb",
            "label": "Curb Example Location",
            "country": "USA",
            "state": "TX",
            "city": "Austin",
            "postcode": "78704",
            "address": "1524 South IH 35",
            "geocode": "30.24567280,-97.76883580",
            "timezone": "America/Chicago"
        },
        // ... etc ...
    ]
}
```

### `/api/<fleet>/installation`
* Returns a paginated list of all installations in a fleet
* __Query parameters__ - See [Querying](#querying) above.  Common queries include:
    * `location__isnull=0` - return only installation with non-null locations, meaning they have been installed in a location.
* Response schema:
```json
{
    "count": 233,
    "next": "/api/curb/installation?page=2",
    "previous": null,
    "results": [
        {
            "hub": "zzu1caqs",
            "dt_created": "2018-02-06T22:13:11.602644Z",
            "dt_modified": "2019-12-20T22:51:58.633908Z",
            "organization": "curb",
            "label": null,
            "dt_claimed": "2019-12-20T22:51:58.633908Z",
            "panel_type": 0,
            "location": "0b9ba249-7711-4694-956b-a00dd25ac7be",
            "fleet": "curb"
        },
        {
            "hub": "zz8u8imr",
            "dt_created": "2018-02-06T22:12:29.996870Z",
            "dt_modified": "2019-12-20T22:51:58.673504Z",
            "organization": "curb",
            "label": null,
            "dt_claimed": "2019-12-20T22:51:58.673504Z",
            "panel_type": 0,
            "location": null,
            "fleet": "curb"
        },
        // ... etc ...
    ]
}
```


### `/api/<fleet>/register`
* Returns a paginated list of all registers in a fleet
* __Query parameters__ - See [Querying](#querying) above.  Common queries include:
    * `production=1` - return only registers that are configured as production
    * `label__icontains=heater` - return only registers whose label contains the string "heater"
* Response schema:
```json
{
    "count": 3483,
    "next": "/api/curb/register?page=2",
    "previous": null,
    "results": [
        {
            "id": "e16cfed4-08c0-45da-99c0-a861e9c43941",
            "dt_created": "2018-02-06T22:29:05.301097Z",
            "dt_modified": "2018-04-04T17:14:38.116377Z",
            "organization": "curb",
            "label": "Main",
            "number": 0,
            "circuit_type": "main",
            "multiplier": 1,
            "inverted": false,
            "installation": "test0019",
            "clamp_definition": "XIAMEN100",
            "group": 0,
            "channel": 0,
            "grid": true,
            "production": false,
            "battery": false,
            "circuit_number": null
        },
        {
            "id": "dedda052-e325-481a-8737-666ed5903305",
            "dt_created": "2018-02-06T22:31:10.469268Z",
            "dt_modified": "2018-04-04T17:18:26.116353Z",
            "organization": "curb",
            "label": "Solar",
            "number": 1,
            "circuit_type": "line_side_production",
            "multiplier": 1,
            "inverted": true,
            "installation": "test0019",
            "clamp_definition": "XIAMEN30",
            "group": 0,
            "channel": 1,
            "grid": true,
            "production": true,
            "battery": false,
            "circuit_number": null
        },
        // ... etc ...
    ]
}
```

### `/api/<fleet>/subfleets`
* Returns a non-paginated list of all subfleets to the current fleet
* Response schema:
```json
{
    "count": 3,
    "results": [
        "subfleet_1",
        "subfleet_2",
        "subfleet_3"
    ]
}
```

## Querying within a given location

### `/api/<fleet>/location/<location_id>`
* Retrieve a single location
* Response schema:
```json
{
    "id": "4d6874eb-2499-41dc-88ce-2dc570099f5e",
    "dt_created": "2020-06-23T23:26:26.581017Z",
    "dt_modified": "2020-06-23T23:27:05.696942Z",
    "organization": "curb",
    "label": "Curb Example Location",
    "country": "USA",
    "state": "TX",
    "city": "Austin",
    "postcode": "78704",
    "address": "1524 South IH 35",
    "geocode": "30.24567280,-97.76883580",
    "timezone": "America/Chicago"
}
```

### `/api/<fleet>/location/<location_id>/metadata`
* Retrieve high-level location metadata for a given location.
* Response schema:
```json
{

    "mains": true,
    "battery": false,
    "production": true,
    "installations_count": 2,
    "dt_claimed": "2018-02-23T22:12:48.948Z",
    "dt_modified": "2018-07-18T16:57:48.927Z",
    "dt_installed": "2018-02-23T22:12:48.948Z"
}
```

### `/api/<fleet>/location/<location_id>/installation`
* Retrieves a list of installations for a given location.
* Response schema:
```json
{
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
        {
            "hub": "c0kw1n3y",
            "dt_created": "2018-02-06T22:12:34.019563Z",
            "dt_modified": "2020-08-18T21:07:02.811135Z",
            "organization": "curb",
            "label": "Indoor Hub",
            "dt_claimed": "2017-07-13T19:00:00Z",
            "panel_type": 2,
            "location": "59fbc0d5-dc2b-416a-aa98-d6f302df7c7a",
            "fleet": "curb"
        },
        {
            "hub": "cbas9lkr",
            "dt_created": "2018-02-06T22:14:03.022571Z",
            "dt_modified": "2020-08-18T21:07:04.222241Z",
            "organization": "curb",
            "label": "Outdoor Hub",
            "dt_claimed": "2017-07-13T19:00:00Z",
            "panel_type": 0,
            "location": "59fbc0d5-dc2b-416a-aa98-d6f302df7c7a",
            "fleet": "curb"
        }
    ]
}
```

### `/api/<fleet>/location/<location_id>/register`
* Retrieves a list of registers for a given location
* __Query parameters__ - See [Querying](#querying) above.
* Response schema:
```json
{
    "count": 36,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": "5c89cba5-d348-480e-a895-5032b3ae1c1f",
            "dt_created": "2018-02-06T22:20:09.299415Z",
            "dt_modified": "2018-07-26T20:06:20.169613Z",
            "organization": "curb",
            "label": "Guest, Hall (2F)",
            "number": 0,
            "circuit_type": "consumption",
            "multiplier": 1,
            "inverted": false,
            "installation": "c0kw1n3y",
            "clamp_definition": "XIAMEN30",
            "group": 0,
            "channel": 0,
            "grid": false,
            "production": false,
            "battery": false,
            "circuit_number": 1
        },
        {
            "id": "e70c26d8-08ac-4bdf-8a5c-a8f2bf6b7d40",
            "dt_created": "2018-02-06T22:22:17.011156Z",
            "dt_modified": "2018-07-18T16:57:48.927001Z",
            "organization": "curb",
            "label": "Kitchen Disp/Dish",
            "number": 1,
            "circuit_type": "consumption",
            "multiplier": 1,
            "inverted": false,
            "installation": "c0kw1n3y",
            "clamp_definition": "XIAMEN30",
            "group": 0,
            "channel": 1,
            "grid": false,
            "production": false,
            "battery": false,
            "circuit_number": 5
        },
        // ... etc ...
    ]
}
```

## Querying within a given installation/hub by serial number

### `/api/<fleet>/installation/<hub_serial>`
* Retrieve a single installation for a given hub serial number.
* Response schema:
```json
{
    "hub": "zzu1caqs",
    "dt_created": "2018-02-06T22:13:11.602644Z",
    "dt_modified": "2019-12-20T22:51:58.633908Z",
    "organization": "curb",
    "label": null,
    "dt_claimed": "2019-12-20T22:51:58.633908Z",
    "panel_type": 0,
    "location": "0b9ba249-7711-4694-956b-a00dd25ac7be",
    "fleet": "curb"
}
```

### `/api/<fleet>/installation/<hub_serial>/registers`
* Retrieve a list of registers for a given installation by hub serial number
* __Query parameters:__ see the location 
* Response schema:
```json
{
    "count": 18,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": "43492557-a1d5-4aee-9382-dd01aea923c7",
            "dt_created": "2018-02-06T22:19:50.181556Z",
            "dt_modified": "2020-02-15T00:01:57.580434Z",
            "organization": "curb",
            "label": "Main I",
            "number": 0,
            "circuit_type": "main",
            "multiplier": 1,
            "inverted": false,
            "installation": "cbas9lkr",
            "clamp_definition": "XIAMEN100",
            "group": 0,
            "channel": 0,
            "grid": true,
            "production": false,
            "battery": false,
            "circuit_number": null
        },
        {
            "id": "feb47210-59d0-4628-af8e-bb93da531afb",
            "dt_created": "2018-02-06T22:21:57.970821Z",
            "dt_modified": "2020-06-16T16:34:52.936175Z",
            "organization": "curb",
            "label": "Solar (West)",
            "number": 1,
            "circuit_type": "line_side_production",
            "multiplier": 2,
            "inverted": false,
            "installation": "cbas9lkr",
            "clamp_definition": "XIAMEN30",
            "group": 0,
            "channel": 1,
            "grid": true,
            "production": true,
            "battery": false,
            "circuit_number": 1
        },
        // ... etc ...
    ]
}
```

### `/api/<fleet>/hub/<hub_serial>`
* Retrieve a single hub for a given hub serial number.  The hub object gives us hardware/software information about the hub.
* Response schema:
```json
{
    "id": "zzu1caqs",
    "dt_created": "2018-02-06T21:27:03.738178Z",
    "dt_modified": "2018-04-26T18:53:52.710786Z",
    "organization": "curb",
    "model_number": "00617",
    "software": "2.1.0-staging",
    "os": null,
    "hardware": "1.5"
}
```

### `/api/<fleet>/hub_connectivity/<hub_serial>`
* Returns the hub_connectivity object for the given hub serial.  This is useful if you want to determine whether or not a hub is currently online.  This record is updated every 30 minutes.
  * `connection_health` is a floating point number between `0` and `1` where `0` is a hub that has not been heard from in several minutes, and `1` is a hub that is currently online with a strong PLC connection.
* Response schema:
```json
{
    "hub": "cbas9lkr",
    "dt_created": "2018-02-22T21:01:13.860593Z",
    "dt_modified": "2020-09-03T18:44:54.050415Z",
    "last_post_diagnostics": 1599158693,
    "plc_connection": 1,
    "ip_address": "104.40.114.12",
    "connection_health": 1
}
```

### `/api/<fleet>/register/<register_id>`
* Retrieve a single register for a given register id.
* Response schema:
```json
{
    "id": "6f4de367-4fd9-4ce8-b3fa-76290d5837a0",
    "dt_created": "2018-09-04T20:31:38.912825Z",
    "dt_modified": "2018-09-04T20:33:49.393889Z",
    "organization": "curb",
    "label": "Solar",
    "number": 7,
    "circuit_type": "line_side_production",
    "multiplier": 2,
    "inverted": false,
    "installation": "test3007",
    "clamp_definition": "XIAMEN50",
    "group": 1,
    "channel": 1,
    "grid": true,
    "production": true,
    "battery": false,
    "circuit_number": null
}
```


Documentation for our historical and real-time data services coming soon
