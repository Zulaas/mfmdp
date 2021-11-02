class TokenManager {

  constructor(clientId, oauthServer, sessionStorageKey) {
    this.clientId = clientId;
    this.oauthServer = oauthServer;
    this.sessionStorageKey = sessionStorageKey;
  }

  //PKCE Flow function to get valid ID and Access Token
   loadToken(){

    //check if we already have a token
     if(sessionStorage.getItem(this.sessionStorageKey)){
       return sessionStorage.getItem(this.sessionStorageKey);
     }

     //if get redirected from authorize endpoint with code and state
      let urlParams = new URLSearchParams(window.location.search);
      if(urlParams.has('code') && urlParams.has('state')){
        let code = urlParams.get('code');
        if(!sessionStorage.getItem('verifier') ){
          throw 'verifier isn\'t set in sessionStorage';
        }
        if(!sessionStorage.getItem('state')){
          throw 'state isn\'t set in sessionStorage';
        }
        let verifier = sessionStorage.getItem('verifier');
        let state = sessionStorage.getItem('state');
        if(state !== urlParams.get('state')){
          throw 'state is not valid';
        }
        let params = {
          'grant_type' : 'authorization_code',
          'client_id' : this.clientId,
          'code_verifier': verifier,
          'code': code,
          'redirect_uri' : location.href,
        }
        //request to get ID and Access token from token Endpoint
        fetch(this.oauthServer + '/token?' + this.makeQueryParams(params))
          .then(response => response.json())
          .then(data => console.log(data));
        return
      }

      //initial request to get authorized
      let verifier = this.getRandomString(32)
      let state = this.getRandomString(32)
      sessionStorage.setItem("verifer", verifier);
      sessionStorage.setItem('state', state);

      let challenge = Sha256.hash(verifier);
      let params = {
        'response_type' : 'code',
        'code_challenge': challenge,
        'code_challenge_method' : 's256',
        'client_id' : this.clientId,
        'redirect_uri' : location.href,
        'scope' : '',
        'audience' : '',
        'state' : state
      }
      //redirect to authorize endpoint
      window.location.replace(this.oauthServer + '/authorize?' + this.makeQueryParams(params))

  }

  //build query params from array
  makeQueryParams(params){
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
    return array.join()
  }
}
