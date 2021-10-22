// Listen for postMessage events.
window.addEventListener("message", receiveMessage, false);

var allowedLocations = ['http://localhost'];

//event triggered when message received
function receiveMessage(event) {

  //Validates the origin of the event to prevent cross-site scripting attacks
  var myiframe = document.getElementById('myiframe');
  //origin is 'null' because of sandboxed parameter
  if (event.origin !== 'null' && event.source === myiframe.contentWindow) {
    console.log('origin unknown');
    return;
  }

  //check if event data is a object
  let data = event.data;
  if (typeof data !== "object")
    return;

  //check which event type ist triggered
  switch (data.type) {
    //iframe height changed event
    case "adjust_frame_height":
      for (let iframe of document.getElementsByTagName("iframe")) {
        //check which iframe sent the event
        // and sets the iframe heights according to the event data height
        if (decodeURI(event.data.path) === iframe.getAttribute("src")) {
          iframe.style.height = data.height + "px";
        }
      }
      break;
    case "updateSrc":
      //validates the src parameter if its in a list of allowed locations
      if(!validateLocation(data.src)){
        return;
      }
      for (let iframe of document.getElementsByTagName("iframe")) {
        //check which iframe sent the event
        // and sets the iframe src according to the event data src
        if (decodeURI(event.data.path) === iframe.getAttribute("src")) {
          iframe.setAttribute("src", data.src);
        }
      }
  }
}

function validateLocation(location){
  let pathArray = location.split( '/' );
  let protocol = pathArray[0];
  let host = pathArray[2];
  let url = protocol + '//' + host;
  return allowedLocations.includes(url);
}
