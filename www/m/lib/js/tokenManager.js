class TokenManager {

  constructor(clientId, oauthServer, sessionStorageIDTokenKey, sessionStorageAccessTokenKey, scopes) {
    this.clientId = clientId;
    this.oauthServer = oauthServer;
    this.sessionStorageIDTokenKey = sessionStorageIDTokenKey;
    this.sessionStorageAccessTokenKey = sessionStorageAccessTokenKey;
    this.scopes = scopes;
  }

  checkExpires() {
    let token = sessionStorage.getItem(this.sessionStorageIDTokenKey);
    let payload = this.parseJwt(token);
    let currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime;
  }

  centralLogout(bc) {
    bc.postMessage('logout');
    this.logout()
  }

  logout() {
    sessionStorage.removeItem(this.sessionStorageIDTokenKey);
    window.location.replace(this.oauthServer + '/logout?' + this.getLogoutParams())
  }


  //PKCE Flow function to get ID and Access Token
  async loadToken() {
    return new Promise(async (resolve, reject) => {
        //error Handling
        let urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('error') && urlParams.has('error_code')) {
          window.history.replaceState({}, '', location.pathname);
          return reject({
            'error': urlParams.get('error'),
            'error_code': urlParams.get('error_code')
          });
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
          let params;
          try {
            params = this.getTokenParams(urlParams);
          } catch (e) {
            return reject({'error': e, 'error_code': 'exception'})
          }
          this.postData(this.oauthServer + '/oauth/token', params)
            .then(data => {
              localStorage.removeItem('state');
              localStorage.removeItem('verifier');
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

        //initial request to get authorized | redirect to authorize endpoint
        window.location.replace(this.oauthServer + '/authorize?' + await this.getAuthorizeParams().then(params => {
          return params
        }))
      }
    );
  }

  getLogoutParams() {
    return this.makeQueryParams({
      'client_id': this.clientId,
      'returnTo': 'http://localhost'
    });
  }

  //get the essential parameters for requesting Token-Endpoint
  getTokenParams(urlParams) {
    let code = urlParams.get('code');
    if (!localStorage.getItem('verifier')) {
      throw 'verifier isn\'t set in sessionStorage';
    }
    if (!localStorage.getItem('state')) {
      throw 'state isn\'t set in sessionStorage';
    }
    let verifier = localStorage.getItem('verifier');
    let state = localStorage.getItem('state');
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

  //digest returns  a ArrayBuffer this converts the ArrayBuffer to a hex string.
  async digestMessage(message) {
    const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
    // convert bytes to hex string
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  //building the query for the authorize endpoint
  async getAuthorizeParams() {
    let state = this.getRandomString(32)
    let code_verifier = this.getRandomString(32)
    localStorage.setItem("verifier", code_verifier);
    localStorage.setItem('state', state);
    //only working over https and localhost
    let code_challenge = await this.digestMessage(code_verifier).then(code_challenge => {
      return code_challenge
    });
    //for testing with http and hostname use this line
    //let code_challenge = Sha256.hash(code_verifier);


    return this.makeQueryParams({
      'response_type': 'code',
      'code_challenge': code_challenge,
      'code_challenge_method': 'S256',
      'client_id': this.clientId,
      'redirect_uri': location.origin + location.pathname,
      'scope': this.scopes,
      'state': state
    });
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
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  };

}
