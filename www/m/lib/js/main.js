(() => {
  //create Broadcast channel for central logout
  let bc = new BroadcastChannel('central Logout');

  //creates router Object with mapped routes
  let router = new Router({
    '/': 'http://localhost:81/TeamHome/home.html',
    '/TeamKundenverwaltung/kundenverwaltung': 'http://localhost:81/TeamKundenverwaltung/kundenverwaltung.html',
    '/TeamRechnung/rechnung': 'http://localhost:82/TeamRechnung/rechnung.html'
  })
  router.register();

  let iframe = document.getElementById('myiframe');
  let origins = [
    'http://r1.tld',
    'http://r2.tld',
    'http://localhost:81',
    'http://localhost:82'
  ];
  //Register Dispatcher event for frame adjustment
  let dispatcher = new Dispatcher(iframe, origins);
  dispatcher.addListener('adjust_frame_height', adjustFrameHeight)
  dispatcher.register()

  //starts the PKCE Flow
  let scopes = 'openid email profile';
  let tokenManager = new TokenManager(
    'client1',
    'http://localhost:8080',
    'ID-Token',
    'Access-Token',
    scopes
  );
  tokenManager.loadToken().then(
    (data) => {
      this.setSuccessText(tokenManager, data.id_token, scopes);
      this.setLogoutButton(tokenManager, bc);
      this.setLogoutInterval(tokenManager, bc);
    }
  ).catch(error => {
      this.setErrorText(error);
    }
  );

  //register Broadcast channel function for central logout
  bc.onmessage = function (ev) {
    console.log('central logout');
    tokenManager.logout()
  }
})();

function adjustFrameHeight(data) {
  for (let iframe of document.getElementsByTagName("iframe")) {
    //check which iframe sent the event
    // and sets the iframe heights according to the event data height
    if (decodeURI(event.data.path) === iframe.getAttribute("src")) {
      iframe.style.height = data.height + "px";
    }
  }
}

function setLogoutInterval(tokenManager, bc) {
  window.setInterval(() => {
    //if one token expires initialize a central logout for all taps
    tokenManager.checkExpires() ? tokenManager.centralLogout(bc) : null;
  }, 1000);
}

function setLogoutButton(tokenManager, bc) {
  document.getElementById('logoutBtn').onclick = function (event) {
    tokenManager.centralLogout(bc);
  }
}

function setSuccessText(tokenManager, token, scopes) {
  document.getElementById('tokenPayload').innerText = JSON.stringify(tokenManager.parseJwt(token), undefined, 2);
  this.changeHiddenAttribute(false);
  document.getElementById("scopes").innerText = scopes;
  let split = token.split('.');
  document.getElementById("header").innerText = split[0];
  document.getElementById("payload").innerText = split[1];
  document.getElementById("footer").innerText = split[2];
}

function setErrorText(error) {
  console.log(error.error_code);
  document.getElementById("errorMsg").innerText = error.error;
  this.changeHiddenAttribute(true);
}

function changeHiddenAttribute(type) {
  document.getElementById('successMsg').hidden = type;
  document.getElementById("errorMsg").hidden = !(type);
  document.getElementById('navbar').hidden = type;
  document.getElementById('myiframe').hidden = type;
  document.getElementById('logoutBtn').hidden = type;
}





