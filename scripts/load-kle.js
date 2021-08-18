const path = require('path');
const Promise = require('bluebird');
const util = require('util');
const uuid = require('uuid');
const api = new (require('reflective-api'))({ log_level: 'error' });
const kleConf = require(path.join(__dirname, '../index')).model;

var domain = process.argv[2];
if (!domain) {
    console.log('usage: load-kle <domain>');
    process.exit(0);
}
console.log('loading latest KLE Emneplan and Handlingsfacetter on domain', domain);

api.promise.core.drop({ domain: domain, chain: 'kle' })
.tap(api.promise.index.waitfor)
.tap(() => api.promise.core.drop({ domain: domain, chain: 'kle-stage' }))
.tap(api.promise.index.waitfor)
.tap(function() {
  var extension = 'kle-load-emneplan-' + uuid.v4();
  return api.promise.process.start({
    id: kleConf.kle.instances.process['kle-emneplan-import'].id,
    context: { domain: domain, chain: 'kle', extension: extension }
  });
})
.tap(function() {
  var extension = 'kle-load-handlingsfacetter-' + uuid.v4();
  return api.promise.process.start({
    id: kleConf.kle.instances.process['kle-handlingsfacetter-import'].id,
    context: { domain: domain, chain: 'kle', extension: extension }
  });
})
.catch(function(error) {
  console.error(util.inspect(error, { showHidden: false, depth: 30 }));
});
