var path = require('path');

module.exports = function(files, targets, config) {
  var ret = {
    basePath: path.join(path.dirname(__dirname), 'files'),
    files: files,
    preprocessors: {},
    redirectPreprocessor: config
  }
  for (var i = 0; i < targets.length; i++) {
    ret.preprocessors[targets[i]] = ['redirect'];
  }
  return ret;
}
