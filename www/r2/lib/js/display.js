(() => {
  let scopes = 'openid profile'
  let iframeTokenManager = new IframeTokenManager(
    'r2',
    'http://localhost:8080',
    scopes
  );
  iframeTokenManager.loadToken().then(
    (token) => {
      document.getElementById("content").hidden = false;
      document.getElementById("errorMsg").hidden = true;
      document.getElementById("scopes").innerText = scopes;
      let split = token.split('.');
      document.getElementById("header").innerText = split[0];
      document.getElementById("payload").innerText = split[1];
      document.getElementById("footer").innerText = split[2];
      document.getElementById('tokenPayloadR1').innerText = JSON.stringify(iframeTokenManager.parseJwt(token), undefined, 2);
    }
  ).catch(error => {
      console.log('Error:', error)
      document.getElementById('errorMsg').innerText = error.error;
      document.getElementById("errorMsg").hidden = false;
      document.getElementById("content").hidden = true;
    }
  );
})();
