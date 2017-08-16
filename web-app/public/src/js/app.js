const loginLink = document.querySelector('.login-link');
if(loginLink){
  loginLink
    .addEventListener(
      'click',
      e => {
        e.preventDefault();
        window.open(
          'https://dev-energycurb.auth0.com/authorize?audience=https://app.dev.energycurb.com&scope=openid%20offline_access&response_type=code&client_id=yoltvk4XevWSDDF3dhCWMD77lHNAJcH0&redirect_uri=http://localhost:8080/curb-code-grant&state=',
          null,
          [
            'menubar=no',
            'location=yes',
            'resizable=yes',
            'scrollbars=yes',
            'status=no'
          ].join(',')
        );
      },
      true
    );
}
