const oauthWindow = window.open(
  'https://dev-energycurb.auth0.com/authorize?audience=https://app.dev.energycurb.com&scope=openid%20offline_access&response_type=code&client_id=yoltvk4XevWSDDF3dhCWMD77lHNAJcH0&redirect_uri=https://app.dev.energycurb.com/curb-code-grant&state=',
  null,
  'menubar=no,location=yes,resizable=yes,scrollbars=yes,status=no'
);
