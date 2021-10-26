

(() => {
  //creates router Object with mapped routes
  let router = new Router({
    '/' : 'http://r1.tld/TeamHome/home.html',
    '/TeamKundenverwaltung/kundenverwaltung' : 'http://r1.tld/TeamKundenverwaltung/kundenverwaltung.html',
    '/TeamRechnung/rechnung' : 'http://r2.tld/TeamRechnung/rechnung.html'
  })
  router.register();

  let iframe = document.getElementById('myiframe');
  let dispatcher = new Dispatcher(iframe);
  console.log(dispatcher)
  dispatcher.addListener('adjust_frame_height', adjustFrameHeight)
  dispatcher.register()

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





