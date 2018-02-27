# Basic web app example

This is a Node.js Express web app that makes API calls on the backed and renders HTML for the user.  There is no client-side app.  Here's how it works:

1. The index route `/` will redirect to the Auth0 hosted login page.
2. Upon successfull login, it will redirect to the `/curb-code-grant` route in the Node.js app, with the authorization code as a query string in the URL.
3. The Node.js app receives the authorization code, and exchanges it for a user access token with Auth0.  The access token is stored on the user's session.
4. If the token exists on the session, the app considers that session to be authenticated, and it can use that access token to query the Curb API from the Node.js backend.  The Curb data is used to render HTML templates to send to the client.
5. That token also allows the Node.js app to open a websocket connection for each logged in user to receive live data for their location(s).  The live data has not yet been hooked up to the UI, but the backend infrastructure works.

## How to run the example
1. Install dependencies via `npm install`.
2. You will have to create a `config.json` in the `/web-app/app` directory.  There is currently a `config-sample.json` that you can use as a template.  The important values that you will need to populate for your app are:
  * `AUTH_CLIENT_ID` - your Auth0 client ID (ask Curb for this if you do not know)
  * `AUTH_CLIENT_SECRET` - your Auth0 client secret (ask Curb for this if you do not know)
3. Check that whatever your `AUTH_REDIRECT_URI` is in the `config.json`.  If you see an error that 
4. To start the app, run `npm start`
