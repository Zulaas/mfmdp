class TokenManager {

  constructor(clientId, oauthServer, sessionStorageKey) {
    this.clientId = clientId;
    this.oauthServer = oauthServer;
    this.sessionStorageKey = sessionStorageKey;
    // this.scopes = scopes; Todo initialize scopes als array und dann einfach an den request anhängen
  }

  //PKCE Flow function to get valid ID and Access Token
  loadToken() {
    //check if we already have a token
    if (localStorage.getItem(this.sessionStorageKey)) {
      return localStorage.getItem(this.sessionStorageKey); //Todo was passiert wenn wir ein Token haben ?
    }

    //if get redirected from authorize endpoint with code and state
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code') && urlParams.has('state')) {
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
      let params = {
        'grant_type': 'authorization_code',
        'client_id': this.clientId,
        'code_verifier': verifier,
        'code': code,
        'redirect_uri': location.origin + location.pathname
      }

      //request to get ID and Access token from token Endpoint
      this.postData(this.oauthServer + '/oauth/token', params)
        .then(data => {
          console.log(data);
          window.history.replaceState({}, '', location.pathname);
          //Todo validate Token
          localStorage.setItem(this.sessionStorageKey, data.access_token)
        })
        .catch((error) => {
          throw error
        });
      //Todo error part and success part

      return
    }

    //initial request to get authorized
    let verifier = this.getRandomString(32)
    let state = this.getRandomString(32)
    localStorage.setItem("verifier", verifier);
    localStorage.setItem('state', state);

    let challenge = Sha256.hash(verifier);
    let params = {
      'response_type': 'code',
      'code_challenge': challenge,
      'code_challenge_method': 'S256',
      'client_id': this.clientId,
      'redirect_uri': location.origin + location.pathname,
      'scope': 'openid',
      'audience': '', //Todo set audience ?
      'state': state
    }
    //redirect to authorize endpoint
    window.location.replace(this.oauthServer + '/authorize?' + this.makeQueryParams(params))


  }

  //build query params urlencoded from array
  makeQueryParams(params) {
    return Object.keys(params).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
    }).join('&');
  }

  base64URLEncode(str) {
    return str.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
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

}
