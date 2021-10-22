class Microfrontend{

  static message(message){
    parent.postMessage(message, "http://localhost");
  }

  static adjust_frame_height(height) {
    this.message({type: "adjust_frame_height", height: height, path: location.origin + location.pathname + location.hash});
  }

}

(() => {
  let height = 0;
  window.setInterval(() => {
    if (document.documentElement.scrollHeight === height)
      return;
    height = document.documentElement.scrollHeight
    Microfrontend.adjust_frame_height(height)
  }, 100)
})();
