class Dispatcher{

  constructor(iframe) {
    this.callbacks = {}
    this.iframe = iframe
  }

  //adds a callback function with type
  addListener(type, callback){
    this.callbacks[type] = callback
  }

  //registered the EventListener
  register(){
    window.addEventListener("message", (e)=>this.dispatch(e), false);
  }

  dispatch(event) {
    //origin is 'null' because of sandboxed parameter
    //Validates the origin of the event to prevent cross-site scripting attacks
    if (event.origin !== 'null' && event.source === this.iframe.contentWindow) {
      console.log('origin unknown');
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
    this.callbacks[data.type](data);
  }

}
