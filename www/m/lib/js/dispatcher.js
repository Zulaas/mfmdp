class Dispatcher{

  constructor(iframe) {
    this.callbacks = {}
    this.iframe = iframe
  }

  addListener(type, callback){
    this.callbacks[type] = callback
  }

  register(){
    window.addEventListener("message", this.dispatch, false);
  }

  dispatch(event) {
    //origin is 'null' because of sandboxed parameter
    if (event.origin !== 'null' && event.source === this.iframe.contentWindow) {
      console.log('origin unknown');
      return;
    }

    //check if event data is a object
    let data = event.data;
    if (typeof data !== "object")
      return;

    if (this.callbacks[data.type] === 'undefined') {
      console.error('Event not registered', data)
      throw 'Event not registered' + data.type
    }
    this.callbacks[data.type](data);
  }

}
