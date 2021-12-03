class Microfrontend {

  // sends postMessage events.
  static message(message) {
    //the origin of the target window should be restricted
    //in this case to http://m.tld to prevent other pages from receiving any of this messages
    parent.postMessage(message, "http://localhost");
  }

  //creates postMessage event for frame height
  static adjust_frame_height(height) {
    this.message({
      type: "adjust_frame_height",
      height: height,
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
    height = document.documentElement.scrollHeight + 10
    Microfrontend.adjust_frame_height(height)
  }, 100)
})();
