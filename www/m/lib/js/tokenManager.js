class TokenManager {

  constructor(clientId, oauthServer, sessionStorageKey) {
    this.clientId = clientId;
    this.oauthServer = oauthServer;
    this.sessionStorageKey = sessionStorageKey;
  }

   loadToken(){
      if(sessionStorage.getItem(this.sessionStorageKey)){
        return sessionStorage.getItem(this.sessionStorageKey);
      }
      let verifier = this.getRandomString(32)
      sessionStorage.setItem("verifer", verifier);
      let state = this.getRandomString(32)


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
      window.location.replace(this.oauthServer + '/authorize?' + this.makeQueryParams(params))


  }

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

   getRandomString(length) {
    let array = new Uint16Array(length)
    window.crypto.getRandomValues(array)
    return array.join()
  }
}
