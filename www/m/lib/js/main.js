(() => {
  let bc = new BroadcastChannel('central Logout');

  //creates router Object with mapped routes
  let router = new Router({
    '/': 'http://localhost:81/TeamHome/home.html',
    '/TeamKundenverwaltung/kundenverwaltung': 'http://localhost:81/TeamKundenverwaltung/kundenverwaltung.html',
    '/TeamRechnung/rechnung': 'http://localhost:82/TeamRechnung/rechnung.html'
  })
  router.register();

  let iframe = document.getElementById('myiframe');
  let origins = ['http://r1.tld', 'http://r2.tld', 'http://localhost:81', 'http://localhost:82'];
  let dispatcher = new Dispatcher(iframe, origins);
  console.log(dispatcher)
  dispatcher.addListener('adjust_frame_height', adjustFrameHeight)
  dispatcher.register()

  //starts the PKCE Flow
  let tokenManager = new TokenManager('client1', 'http://localhost:8080', 'ID-Token', 'Access-Token')
  tokenManager.loadToken().then(
    (data) => {
      document.getElementById('tokenPayload').innerText = JSON.stringify(tokenManager.parseJwt(data.id_token), undefined, 2);
      document.getElementById('successMsg').hidden = false;
      document.getElementById("errorMsg").hidden = true;
      document.getElementById('navbar').hidden = false;
      document.getElementById('myiframe').hidden = false;
      let lbtn = document.getElementById('logoutBtn');
      lbtn.hidden = false;
      lbtn.onclick = function (event) {
        tokenManager.centralLogout(bc);
      }
      window.setInterval(() => {
        tokenManager.checkExpires() ? tokenManager.centralLogout(bc) : null;
      }, 1000);
    }
  ).catch(error => {
      console.log(error.error_code);
      let ele = document.getElementById("errorMsg");
      ele.innerText = error.error;
      ele.hidden = false;
      document.getElementById('myiframe').hidden = true;
      document.getElementById('navbar').hidden = true;
      document.getElementById('logoutBtn').hidden = true;
      document.getElementById('successMsg').hidden = true;
    }
  );

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





