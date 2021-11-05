(() => {
  //creates router Object with mapped routes
  let router = new Router({
    '/': 'http://r1.tld/TeamHome/home.html',
    '/TeamKundenverwaltung/kundenverwaltung': 'http://r1.tld/TeamKundenverwaltung/kundenverwaltung.html',
    '/TeamRechnung/rechnung': 'http://r2.tld/TeamRechnung/rechnung.html'
  })
  router.register();

  let iframe = document.getElementById('myiframe');
  let origins = ['http://r1.tld', 'http://r2.tld'];
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
      let lbtn = document.getElementById('logoutBtn');
      lbtn.hidden = false;
      lbtn.onclick = function (event) {
        tokenManager.logout();
      }
      window.setInterval(() => {
        tokenManager.checkExpires();
      }, 1000);
    }
  ).catch(error => {
      console.log(error.error_code);
      let ele = document.getElementById("errorMsg");
      ele.innerText = error.error;
      ele.hidden = false;
      document.getElementById('navbar').hidden = true;
      document.getElementById('logoutBtn').hidden = true;
      document.getElementById('successMsg').hidden = true;
    }
  );

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





