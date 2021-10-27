class Router {

  constructor(routes) {
    this.routes = routes;
  }

  register() {
    let pathname = null;
    //checks every 100 milliseconds if the current Route has changed
    window.setInterval(() => {
      //return if route has not changed
      if (location.pathname === pathname)
        return;

      //if route is not defined throw exception
      pathname = location.pathname
      if (this.routes[pathname] === 'undefined') {
        throw 'Route not defined:' + pathname;
      }

      //if route has changed change iframe src
      let iframe = document.getElementById("myiframe")
      iframe.setAttribute("src", this.routes[pathname]);
      console.log('route changed to:', '\'' + pathname + '\'', 'according to map set src-attribute from iframe to: ' + '\'' + this.routes[pathname] + '\'')
      console.log(iframe)

      //creates custom 'onChangeEvent' to trigger change of active class
      window.dispatchEvent(new CustomEvent('onRouteChange', {detail: pathname}));

    }, 100);

    //adds an MutationObserver to react on DOM-element changes and disable up comming hrefs in <a>-tags
    var mutationObserver = new MutationObserver(this.disableHrefsInNavbar);
    mutationObserver.observe(window.document, {childList: true, subtree: true})

  }

  //disables all hrefs in navigation on <a>-tags to prefend the mainpage from reloading
  disableHrefsInNavbar(e) {
    for (let nav of document.getElementsByTagName("nav")) {
      for (let elem of nav.getElementsByTagName("a")) {
        elem.onclick = (e) => {
          window.history.pushState(null, null, elem.href);
          e.stopPropagation();
          return false;
        }
      }
    }
  }

}


