function EventBus() {
  // this
  // [eventName]: listeners
}
var proto = EventBus.prototype

proto.emit = function emit(eventName, args) {
  var listeners = this[eventName] || []
  var result
  for (var index = 0; index < listeners.length; index++) {
    result = listeners[index].apply(undefined, args) || result;
  }
  return result
}
proto.on = function on (eventName, cb) {
  if (!this[eventName]) {
    this[eventName] = []
  }
  this[eventName].push(cb)
}

proto.off = function off (eventName, cb) {
  if (!this[eventName]) return
  var eventIndex = this[eventName].indexOf(cb)
  if (eventIndex > -1) {
    this[eventName].splice(eventIndex, 1)
  }
}

module.exports = EventBus