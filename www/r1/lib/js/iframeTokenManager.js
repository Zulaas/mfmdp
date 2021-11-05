class IframeTokenManager {

  constructor(clientId, oauthServer) {
    this.clientId = clientId;
    this.oauthServer = oauthServer;
  }

  //PKCE Flow function to get valid ID and Access Token
  async loadToken() {
    return new Promise((resolve, reject) => {

      //Error handling
      let urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('error') && urlParams.has('error_code')) {
        return reject(urlParams.get('error'), urlParams.get('error_code'));
      }

      //if get redirected from authorize endpoint with code and state
      if (urlParams.has('code') && urlParams.has('state')) {
        let code = urlParams.get('code');
        if (!localStorage.getItem('verifier')) {
          throw 'verifier isn\'t set in localStorage';
        }
        if (!localStorage.getItem('state')) {
          throw 'state isn\'t set in localStorage';
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
            window.history.replaceState({}, '', location.pathname);
            return resolve(data.id_token)
          })
          .catch((error) => {
            return reject(error)
          });
        return ;
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
        'scope': 'openid email',
        'state': state,
        'prompt': 'none'
      }
      //redirect to authorize endpoint
      window.location.replace(this.oauthServer + '/authorize?' + this.makeQueryParams(params))
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
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  };

}
