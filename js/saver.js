const storage = require('electron-json-storage');

module.exports = {
  saveStack: function(stack, cb) {
    return storage.set('stack', {stack: stack}, cb);
  },
  retrieveStack: function(cb) {
    return storage.get('stack', function(err, payload) {
      if( err ) { return cb(err); }
      return cb(null, payload.stack);
    })
  },
  saveSawdust: function(sawdust, cb) {
    return storage.set('sawdust', {sawdust: sawdust}, cb);
  },
  retrieveSawdust: function(cb) {
    return storage.get('sawdust', function(err, payload) {
      if( err ) { return cb(err); }
      return cb(null, payload.sawdust);
    })
  },
}
