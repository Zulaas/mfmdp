
class Router {

  constructor(routes) {
    this.routes = routes;
  }

  register() {
    let pathname = null;
    //checks every 100 milliseconds if the current Route has changed
    window.setInterval(() => {
      //return if route has not changed
      if ( location.pathname === pathname)
        return;

      //if route is not defined throw exception
      pathname = location.pathname
      if(this.routes[pathname] === 'undefined'){
        throw 'Route not defined:' + pathname;
      }

      //if route has changed change iframe src
      let iframe = document.getElementById("myiframe")
      iframe.setAttribute("src", this.routes[pathname]);
      console.log('route changed:', pathname, this.routes[pathname], iframe )

      window.dispatchEvent(new CustomEvent('onRouteChange', {detail: pathname}));

    }, 100);

    var mutationObserver = new MutationObserver(this.disableHrefs);
    mutationObserver.observe(window.document, { childList:true, subtree:true })

  }

  disableHrefs(e){
    console.log("dom changed:" , e)
    for(let elem of document.getElementsByTagName("a")) {
      elem.onclick = (e) => {
        window.history.pushState(null, null, elem.href);
        e.stopPropagation();
        return false;
      }
    }
  }

  validateRoute(route){

  }
}


