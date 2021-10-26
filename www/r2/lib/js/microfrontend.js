class Microfrontend {

  // sends postMessage events.
  static message(message) {
    //the origin of the target window should be restricted
    //in this case to http://localhost to prevent other pages from receiving this message
    parent.postMessage(message, "http://m.tld");
  }

  //creates postMessage event for frame height
  static adjust_frame_height(height) {
    this.message({
      type: "adjust_frame_height",
      height: height,
      path: location.origin + location.pathname + location.hash
    });
  }

  //creates postMessage event for changing the iframe src
  static updateIframe(src) {
    this.message({
      type: "updateSrc",
      src: src,
      path: location.origin + location.pathname + location.hash
    });
  }

}

(() => {
  //checks every 100 milliseconds if the current height of the iframe matches the height of the content
  //if not sends a event with the content heights
  let height = 0;
  window.setInterval(() => {
    if (document.documentElement.scrollHeight === height)
      return;
    height = document.documentElement.scrollHeight
    Microfrontend.adjust_frame_height(height)
  }, 100)
})();
