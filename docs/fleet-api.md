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
* __`__ne`__ - checks if a value does not equal the queried value
  * eg. `city__ne=Phoenix` - returns all objects whose `city` property does not equal "Phoenix".  
* __`__gt`__, __`__lt`__, __`__gte`__, __`__lte`__ - numerical comparison filters.  Useful when filtering by date or other quantitative data.
  * eg. `dt_created__gt=2020-08-30T20:10:13.853850Z` - returns all values created since that date

<!-- By default, this API will only return data belonging to the fleet indicated by the `<fleet>` identifier in the URL.  If that fleet is a parent organization that has subfleets organized underneath it, you can always add `include_all_subfleets=1` query parameter to any API calls to return data that includes all of the subfleets' data as well. -->

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
* __Query parameters__ - See [Querying](#querying) above.
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
    "phase_count": 2,
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

## Historical data
The historical API endpoints allow you to query for the state of a given location at any date range in the past.

### `/api/<fleet>/location/<location_id>/historical`
* Retrieve a list of historical samples for the given location over a given time range.
* __Query parameters__
  * __`start_time (required)`__ - A UTC timestamp.  Return values are inclusive of `start_time`.
  * __`end_time (required)`__  - A UTC timestamp.  Return values are inclusive of `end_time`.
  * __`resolution`__ - The size of the sample period.  A more granular resolution will result in a greater number of samples being returned in the response.  If omitted, `resolution` will be the coarsest possible resolution to effectively cover the queried time range.  `resolution` can be any one of the following:
    * `m` : one minute
    * `5m` : five minutes
    * `h` : one hour
    * `d` : one day
  * __`add_other`__ - When truthy, this will add a virtual register labelled "Other" which represents the difference between grid-measuring registers and non grid-measuring registers.  In practice, "Other" typically represents any consumption that is not being measured.
  * __`include_all_metrics`__ - When truthy, this will include all metrics across both registers and phases.  When omitted, the only metric that is returned is wattage.
  * __`omit_registers`__ - When truthy, this will omit the `registers` array from the response, making for a smaller payload.
  * __Handling missing data__:  These options are useful if you want to handle missing data in the response.  Data can be missing if hubs are temporarily offline, or if data is still being processed by the cloud.
    * __`interpolate`__ - When truthy, this will perform linear interpolation for any partial missing missing data in the range.  Partial missing data is where for a given timestamp where data from one or more hubs is present, but data from one or more hubs is missing.  Interpolation can only take place if one or more data points exist in the range.
    * __`fill_all_gaps`__ - When truthy, this ensures that a complete result is returned for every timestamp in the range will have a result, even if data is missing.  When using this parameter, by default missing data values will be filled with `null`.  If this parameter is used in conjunction with `interpolate`, missing data will be filled with linear interpolated data.

The response contains a `results` array contains a list of objects which contain: 
  * `t` - the timestamp representing the __start__ of that sample period.  
  * `r` - an object containing average register-level readings over the sample period.  Those readings can be:
    * `w` - power (watt-hours)
    * `i` - current (amps)
    * `var` - reactive power (var)
    * `p` - power factor (cosφ)
  * `ph` - an object containing average phase-level readings over the sample period.  Those readings can be:
    * `v` - voltage (volts)
    * `f` - frequency (Hz)
    * `t` - THD fundamental
    * `tg` - THD group
    * `ts` - THD subgroup

By default, there is a `registers` array that is included in the response.  For each numeric value in the `r` value arrays, __the register that it corresponds to is based on its positional index in the array__.  The value readings for the first register in the `registers` array are the first in each `r` value array, and the readings for the second registers are the second in each `r` value array, and so on.  This structure is designed to keep the payload size small.  If you want to reduce the payload size further and you already have a list of the location registers, you can use `?omit_register=1` to remove them from the historical response.

Example response:
```json
{
    "count": 12,
    "start": 1600160400,
    "end": 1600163999,
    "resolution": "5m",
    "hubs": [
        "cbas9lkr",
        "c0kw1n3y"
    ],
    "registers": [
        {
            "id": "5c89cba5-d348-480e-a895-5032b3ae1c1f",
            "label": "Guest, Hall (2F)",
            "group": 0,
            "channel": 0,
            "grid": false,
            "production": false,
            "battery": false
        },
        // ... etc ...
    ],
    "results": [
        {
            "t": 1600160400,
            "r": {
                "w": [ 944, 0, 0, 0, 0, 0, 675, 0, 0, 0, 73, 97, 484, 0, 0, 327, 0, 0, 0, 0, 0, 41, 23, 124, 0, 0, 0, 0, 0, 120, 0, 43, 0, 93, 25, 76 ]
            }
        },
        {
            "t": 1600160700,
            "r": {
                "w": [ 885, 0, 0, 0, 0, 0, 616, 0, 0, 0, 74, 96, 485, 0, 0, 327, 0, 0, 0, 0, 0, 41, 23, 10, 0, 0, 0, 0, 0, 121, 0, 39, 0, 91, 25, 77 ]
            }
        },
        // ... etc ...
    ]
}
```

Example response with `?include_all_metrics=1`:
```js
{
    "count": 12,
    "start": 1600160400,
    "end": 1600163999,
    "resolution": "5m",
    "hubs": [
        "cbas9lkr",
        "c0kw1n3y"
    ],
    "registers": [
        {
            "id": "43492557-a1d5-4aee-9382-dd01aea923c7",
            "label": "Main I",
            "group": 0,
            "channel": 0,
            "grid": true,
            "production": false,
            "battery": false
        },
        // ... etc ...
    ],
    "results": [
        {
            "t": 1600160400,
            "r": {
                "w": [ 944, 0, 0, 0, 0, 0, 675, 0, 0, 0, 73, 97, 484, 0, 0, 327, 0, 0, 0, 0, 0, 41, 23, 124, 0, 0, 0, 0, 0, 120, 0, 43, 0, 93, 25, 76  ],
                "i": [ 8.91129, 0.313598, -0.180953, -0.57738, 0.0100264, 0.0128584, 5.89242, 0.0791024, 0.00377053, 0.00378806, 0.647756, 1.76359, 4.48799, 0.0161248, 0.00389033, 3.0919, 0.00383073, 0.00380384, 0.00544036, 0.0104897, 0.0930977, 0.533472, 0.693767, 2.97793, 0.0887351, 0.0199297, 0.108851, 0.0315248, 0.0615197, 1.37082, 0.0978306, 0.517392, 0.0111373, 2.95713, 0.287875, 0.815996 ],
                "var": [ -261, -36, -21, -66, 0, 0, 0, 0, 0, 0, 19, 151, 189, 0, 0, 152, 0, 0, 0, 0, 0, 24, 75, 156, 0, 0, 0, 0, 0, 0, 0, 24, 0, 309, 11, 48  ],
                "p": [ 0.957963, -0.0254771, 0.0177084, 0.0342777, 0.728773, 0.763866, 0.997617, 0.576707, 0.191507, 0.160577, 0.968551, 0.453751, 0.926829, 0.762625, 0.15187, 0.911639, 0.000862274, 0.000251709, 0.55091, 0.497363, 0.769395, 0.721912, 0.362256, 0.266048, 0.649236, 0.922811, 0.989916, 0.745177, 0.738845, 0.999794, 0.575275, 0.827033, 0.993655, 0.30355, 0.973018, 0.758378 ]
            },
            "ph": {
                "v": [ 
                    [ 119.52, 119.223, 120.088, 120.182 ], 
                    [ 120.268, 119.971, 119.021, 119.186 ]  
                ],
                "f": [ 
                    [ 59.999, 59.9877, 59.9893, 59.9888 ], 
                    [ 59.9908, 59.9879, 59.9894, 59.9887 ]
                ]
            }
        },
        // ... etc ...
    ]
}
```

### `/api/<fleet>/location/<location_id>/aggregate`
* Retrieve a summary for each register the given location over a given time range.  This endpoint is most commonly used to retrieve average power (watt-hours) and energy (kWh) over an arbitrary time range.
* __Query parameters__
  * __`start_time (required)`__ - A UTC timestamp.  Return values are inclusive of `start_time`.
  * __`end_time (required)`__  - A UTC timestamp.  Return values are inclusive of `end_time`.
  * __`resolution`__ - The size of the sample period.  A more granular resolution will result in a greater number of samples being returned in the response.  If omitted, `resolution` will be the coarsest possible resolution to effectively cover the queried time range.  `resolution` can be any one of the following:
    * `m` : one minute
    * `5m` : five minutes
    * `h` : one hour
    * `d` : one day
  * __`add_other`__ - When truthy, this will add a virtual register labelled "Other" which represents the difference between grid-measuring registers and non grid-measuring registers.  In practice, "Other" typically represents any consumption that is not being measured.

```js
{
    "samples_count": 24,
    "start": 1600160400,
    "end": 1600163999,
    "hubs": [
        "c0kw1n3y",
        "cbas9lkr"
    ],
    "resolution": "5m",
    "results": [
        {
            "avg": 967,
            "min": 738,
            "max": 1483,
            "sum": 11603,
            "kwh": 0.968,
            "register": {
                "id": "5c89cba5-d348-480e-a895-5032b3ae1c1f",
                "label": "Guest, Hall (2F)",
                "group": 0,
                "channel": 0,
                "grid": false,
                "production": false,
                "battery": false
            }
        },
        // ... etc ...
    ]
}
```
<!-- 
### `/api/<fleet>/location/<location_id>/latest`
* Retrieves the most recent seconds-level sample for the given location.  If there are no samples in the last 10 seconds, this will return a 400 error.  Although the real time API described below is faster and performs better, this endpoint can be used in situations where websockets might not be available.
* __Query parameters__
  * __`add_other`__ - When truthy, this will add a virtual register labelled "Other" which represents the difference between grid-measuring registers and non grid-measuring registers.  In practice, "Other" typically represents any consumption that is not being measured.
  * __`include_all_metrics`__ - When truthy, this will include all metrics across both registers and phases.  When omitted, the only metric that is returned is wattage.
  * __`omit_registers`__ - When truthy, this will omit the `registers` array from the response, making for a smaller payload.
  * __Handling missing data__:  These options are useful if you want to handle missing data in the response.  Data can be missing if hubs are temporarily offline, or if data is still being processed by the cloud.
    * __`interpolate`__ - When truthy, this will perform linear interpolation for any partial missing missing data in the range.  Partial missing data is where for a given timestamp where data from one or more hubs is present, but data from one or more hubs is missing.  Interpolation can only take place if one or more data points exist in the range.
    * __`fill_all_gaps`__ - When truthy, this ensures that a complete result is returned for every timestamp in the range will have a result, even if data is missing.  When using this parameter, by default missing data values will be filled with `null`.  If this parameter is used in conjunction with `interpolate`, missing data will be filled with linear interpolated data.

The response follows the same schema as the `/historical` endpoint described above.

## Real time API
Using our real time API, you can subscribe to a "stream" of live data for one or more locations in your fleet.  Using the websocket protocol, the real time API pushes hub sample data as soon as it is received (approximately 1 sample per second per hub in a given location).  

The real time API expects JSON for both inbound and outbound messages.  All messages, both inbound and outbound, should have the following format:

```js
{
    "type": "<event_type>",
    "payload": {
        /* payload data goes here */
    }
}
```

Every message should have an event type designated by the `type` value to indicate what to do with the given message.  Possible types that can server can send are:

__Server message event types__ - these are event types a websocket client can receive from the server:
* `live` - a new live data snapshot
* `status` - a status message about the websocket connection
* `error` - an error.  It's `payload` should have a `message` string.
* `request_response` - a response to a client `request` event

__Client message event types__ - these are event types that a websocket client can send to the server:
* `subscribe` - subscribe to start receiving updates on a particular data type, usually a location
* `unsubscribe` - unsubscribe to stop receiving updates on particular data type, usually a location
* `request` - make a ad-hoc request for data

#### Authenticating to the real time API

Authenticating to the real time API works in much the same way as the REST API.  Once you [obtain a token as described in the Authentication section above](#authentication), use it in the `Authentication` header of the WebSocket handshake.  Here is an example of how that would be done using the [ws](https://github.com/websockets/ws) JavaScript library:

```js
const WebSocket = require('ws');
const socket = new WebSocket('wss://admin.energycurb.com/live.io', [], {
    headers: {
        // `accessToken` is the JWT received from the authentication request
        authorization: `Bearer ${accessToken}`
    }
});
```

#### Subscribing to a location
After connecting, a can now send the following message to subscribe to a location:

```js
// client message
{
    "type": "subscribe",
    "payload": {
        "location": "<location_id>"
    }
}
```

After successfully subscribing, the client will start receiving `live` events at the rate of of approximately 1 message per second per hub, which come in the following format:

```js
// server message
{ 
    "type": "live",
    "payload": { 
        "location": "<location_id",
        "data": { 
            "t": 1600364387, 
            "r": {
                "w": [ 52, 0, 0, 40, 22, 35, 0, 0, 27, 0, 0, 14, 106, 54, 0, 497, 14, 28, 1134, -1133, 0, -666, 0, 0, 804, 0, 0, 0, 0, 124, 481, 0, 0, 325, 0, 0 ]
            }
        } 
    } 
}
```

The format is similar to the historical API response.  You will need a list of registers, which will map to the appropriate wattage value by index.  A client can either request those registers via the REST API, or as a convenience, you can request them through the real time API.  

```js
// client message
{
    "type": "request",
    "payload": {
        "location": "<location_id>",
        "data_type": "registers"
    }
}
```

Upon receiving the request, the server will respond with the following message:

```js
// server message
{ 
    "type": "request_response",
    "payload": { 
        "data_type": "registers",        
        "location": "59fbc0d5-dc2b-416a-aa98-d6f302df7c7a",
        "data": [ 
            {
                "id": "5c89cba5-d348-480e-a895-5032b3ae1c1f",
                "label": "Guest, Hall (2F)",
                "group": 0,
                "channel": 0,
                "grid": false,
                "production": false,
                "battery": false
            },
            // ... etc ...
        ] 
    } 
}
``` -->
