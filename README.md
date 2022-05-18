# Curb Integrations

## Curb v4 API

### Please see the [full OpenAPI docs for the Curb v4 API here](https://curb-v2.github.io/third-party-app-integration/index.html)

### Query parameters

#### Describing times, ranges, and resolutions

__Timestrings__ 
You can use a timestring to describe a time range or a data resolution.

Unit | Value | | | Resolution unit | Value
--- | --- | --- | --- | --- | ---
__m__ | minutes | | | __m__ | minutes
__h__ | hours | | | __5m__ | 5 minutes
__d__ | days | | | __h__ | hours
__w__ | weeks | | | __d__ | days
__mo__ | months
__y__ | years

The `from_now_range` parameter is a string representing the amount of time back from the present moment that you would like to query. It must contain a magnitude and a unit value. For example, to query the last 15 minutes, your rangeId would be "15m". To query the last 6 weeks, the rangeId would be "6w".

The `resolution` parameter specifies what granularity level you would like to query. Note that smaller resolutions will result in slower requests and larger response payloads. "m", "5m", "h", and "d" are the only allowed resolution values.

You can also define a range by using both `start` and `end` query parameters.  These are dates, which can either be [ISO standard strings](https://en.wikipedia.org/wiki/ISO_8601) or [Unix timestamps](https://en.wikipedia.org/wiki/Unix_time).  Curb sample data uses Unix timestamps, so when 
