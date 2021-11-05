class TokenManager {

  constructor(clientId, oauthServer, sessionStorageIDTokenKey, sessionStorageAccessTokenKey) {
    this.clientId = clientId;
    this.oauthServer = oauthServer;
    this.sessionStorageIDTokenKey = sessionStorageIDTokenKey;
    this.sessionStorageAccessTokenKey = sessionStorageAccessTokenKey;
    // this.scopes = scopes; Todo initialize scopes als array und dann einfach an den request anhängen
  }

  checkExpires() {
    let token = sessionStorage.getItem(this.sessionStorageIDTokenKey);
    let payload = this.parseJwt(token);
    let currentTime = Math.floor(Date.now() / 1000)
    if (payload.exp < currentTime) {
      this.logout()
    }
  }

  //logout function
  logout() {
    sessionStorage.removeItem(this.sessionStorageIDTokenKey);
    let params = {
      'client_id': this.clientId,
      'returnTo': 'http://m.tld'
    };
    window.location.replace(this.oauthServer + '/logout?' + this.makeQueryParams(params))
  }

  //PKCE Flow function to get ID and Access Token
  async loadToken() {
    return new Promise((resolve, reject) => {
        //error Handling
        let urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('error') && urlParams.has('error_code')) {
          return reject(urlParams.get('error'), urlParams.get('error_code'));
        }

        //check if we already have a token
        if (sessionStorage.getItem(this.sessionStorageIDTokenKey) &&
          sessionStorage.getItem(this.sessionStorageAccessTokenKey)) {
          this.checkExpires(); //check if token isn't expired
          return resolve({
            'id_token': sessionStorage.getItem(this.sessionStorageIDTokenKey),
            'access_token': sessionStorage.getItem(this.sessionStorageAccessTokenKey)
          }); //returns the token
        }

        //if get redirected from authorize endpoint with code and state
        if (urlParams.has('code') && urlParams.has('state')) {
          //request to get ID and Access token from token Endpoint
          this.postData(this.oauthServer + '/oauth/token', this.getTokenParams(urlParams))
            .then(data => {
              //replaces code and state
              window.history.replaceState({}, '', location.pathname);
              //saves id and access Token in sessionStorage
              sessionStorage.setItem(this.sessionStorageIDTokenKey, data.id_token)
              sessionStorage.setItem(this.sessionStorageAccessTokenKey, data.access_token)
              return resolve({'id_token': data.id_token, 'access_token': data.access_token})
            })
            .catch((error) => {
              window.history.replaceState({}, '', location.pathname);
              return reject(error)
            });

          return
        }

        //initial request to get authorized
        //redirect to authorize endpoint
        window.location.replace(this.oauthServer + '/authorize?' + this.getAuthorizeParams())
      }
    );
  }

  //get the essential parameters for requesting Token-Endpoint
  getTokenParams(urlParams) {
    let code = urlParams.get('code');
    if (!sessionStorage.getItem('verifier')) {
      throw 'verifier isn\'t set in sessionStorage';
    }
    if (!sessionStorage.getItem('state')) {
      throw 'state isn\'t set in sessionStorage';
    }
    let verifier = sessionStorage.getItem('verifier');
    let state = sessionStorage.getItem('state');
    if (state !== urlParams.get('state')) {
      throw 'state is not valid';
    }
    return {
      'grant_type': 'authorization_code',
      'client_id': this.clientId,
      'code_verifier': verifier,
      'code': code,
      'redirect_uri': location.origin + location.pathname
    }
  }

  //building the query for the authorize endpoint
  getAuthorizeParams() {
    let verifier = this.getRandomString(32)
    let state = this.getRandomString(32)
    let challenge = Sha256.hash(verifier);

    sessionStorage.setItem("verifier", verifier);
    sessionStorage.setItem('state', state);

    let params = {
      'response_type': 'code',
      'code_challenge': challenge,
      'code_challenge_method': 'S256',
      'client_id': this.clientId,
      'redirect_uri': location.origin + location.pathname,
      'scope': 'openid',
      'state': state
    }
    return this.makeQueryParams(params)
  }

  //build query params urlencoded from array
  makeQueryParams(params) {
    return Object.keys(params).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
    }).join('&');
  }

  //generates crypto save random String
  getRandomString(length) {
    let array = new Uint16Array(length)
    window.crypto.getRandomValues(array)
    return array.join('').substring(0, length)
  }

  // POST method implementation:
  async postData(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(data)
    });
    return response.json();
  }

  parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  };

}
