var createRedirectPreprocessor = require('../../../lib/redirect.js');

var mockLogger = {create: function (name) {
  return { debug: function(msg) {
  }}; 
}};

module.exports = function(config) {
  return createRedirectPreprocessor(mockLogger, config.basePath, config.proxies,
    config.files, config.preprocessors, config.redirectPreprocessor, config);
}
