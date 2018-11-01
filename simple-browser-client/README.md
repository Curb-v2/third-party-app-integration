This is an example of a simple browser client that authenticates Curb users and can access historical and live data for all of their locations.  This uses the Implicit Grant OAuth 2.0 flow.

### How to run
This example app is designed to be run just in a browser, no back-end support necessary.  Here's all you need to run it.

* Start a static server in this directory running on port `8000`.  You can run `npm start` (after an `npm install`) to start the server.
* Navigate to `http://localhost:8000`.

### About this app
In the interest of being as simple and generic as possible, this app is built with jQuery, but you don't have to use jQuery.  The same methodologies used in this app could be applied to any front-end framework.  The only third-party dependency that is required is [socket.io](https://socket.io), which is used to connect to Curb's live data stream.

All Curb services use [Auth0](https://auth0.com) as their authentication provider.  This means that users authenticate with Auth0, which in turn provides them with tokens to access the Curb APIs.  This app talks to Auth0 via the [Auth0 Lock](https://github.com/auth0/lock) widget.  This is not required - Auth0 has [a more generic library called auth0.js](https://github.com/auth0/auth0.js), and you can also call their API directly if you like.

### Caveats
If you wish to run your app on your own domain (not `http://localhost:8000`), Curb will need to whitelist your domain as an allowed origin.
