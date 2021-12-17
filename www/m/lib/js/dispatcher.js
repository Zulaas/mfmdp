class Dispatcher {

  /**
   *
   * @param iframe HTMLIFrameElement
   * @param allowOrigins String[]
   */
  constructor(iframe, allowOrigins) {
    this.callbacks = {}
    if(typeof iframe === "undefined" || iframe === null){ //Todo fix in DemoV1 eintragen
      throw 'iframe is undefined'
    }
    this.iframe = iframe
    this.allowOrigins = allowOrigins
  }

  //adds a callback function with type
  addListener(type, callback) {
    this.callbacks[type] = callback
  }

  //registered the EventListener
  register() {
    window.addEventListener("message", (e) => this.dispatch(e), false);
  }

  dispatch(event) {
    //origin is 'null' because of sandboxed parameter
    //Validates the origin of the event to prevent cross-site scripting attacks
    if (this.allowOrigins.indexOf(event.origin) === -1 || event.source !== this.iframe.contentWindow) {
      console.log('origin unknown', event.origin);
      return;
    }

    //check if event data is a object
    let data = event.data;
    if (typeof data !== "object")
      return;

    //throws an Error and Exception if an Event occures that is not registered
    console.log(data, this.callbacks)
    if (this.callbacks[data.type] === 'undefined') {
      console.error('Event not registered', data)
      throw 'Event not registered' + data.type
    }
    //calls the actual function
    let result = this.callbacks[data.type](data);
  }

}
