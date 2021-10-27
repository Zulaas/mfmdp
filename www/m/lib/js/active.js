//added a EventListener for the Custom 'onRouteChange' Event triggered in the router
window.addEventListener('onRouteChange', changeActiveAttribute)

//Changed Active class on a tags when location is changed
function changeActiveAttribute(e) {
  var links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    if (links[i].getAttribute('href') !== e.detail) {
      links[i].classList.remove('active');
    } else {
      links[i].classList.add('active');
    }
  }
}
