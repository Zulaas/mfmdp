// Listen for postMessage events.
window.addEventListener("message", receiveMessage, false);

//event triggered when message received
function receiveMessage(event) {
  console.log("receive Message in parent element: ", event)

  //check if event data is a object
  let data = event.data;
  if (typeof data !== "object")
    return;

  //check which event type ist triggered
  switch (data.type) {
    case "adjust_frame_height":
      console.log("adjust height: ", event);
      for (let iframe of document.getElementsByTagName("iframe")) {
        let origin = event.origin;
        if (origin === "null") {
          origin = "";
        }
        //check which iframe sent the event
        // and sets the iframe heights according to the event data height
        if (decodeURI(event.data.path) === iframe.getAttribute("src")) {
          iframe.style.height = data.height + "px";
        }
      }
      break;
    case "route":
      window.history.pushState(null, data.path, data.path);
      break;
  }
}
