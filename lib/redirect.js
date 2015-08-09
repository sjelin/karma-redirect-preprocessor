var minimatch = require('minimatch');
var glob = require('glob');
var path = require('path');

function myMinimatch(filePath, basePath, pattern) {
  return minimatch(filePath, path.resolve(basePath, pattern));
}

function getTargetsMap(basePath, files, targetGlobs) {
  var targetArray = [].concat.apply([], targetGlobs.map(function(pattern) {
    return glob.sync(path.resolve(basePath, pattern));
  })).filter(function(target) {
    for (var i = 0; i < files.length; i++) {
      if (myMinimatch(target, basePath, files[i].pattern || files[i])) {
        return true;
      }
    }
    return false;
  });
  var targetsMap = {};
  for (var i = 0; i < targetArray.length; i++) {
    targetsMap[targetArray[i]] = true;
  }
  return targetsMap;
}

function unincludeTargets(basePath, file, targetsMap, targetGlobs) {
  var fileObj = typeof file == typeof '' ? {pattern: file} : file;

  // If the file is already not included there's nothing to do
  if (fileObj.included === false) {
    return file;
  }

  // If the file's pattern is a target glob we can say for certain that none of
  // the files should be included
  if (targetGlobs.indexOf(fileObj.pattern) != -1) {
    fileObj.included = false;
    return fileObj;
  }

  // If the file's pattern doesn't match any targets there's nothing to do
  var containsTargets = (function() {
    for (var target in targetsMap) {
      if (myMinimatch(target, basePath, fileObj.pattern)) {
        return true;
      }
    }
    return false;
  })();
  if (!containsTargets) {
    return file;
  }

  // At this point we have to access the file system to figure out what to do
  // with this file
  var files = glob.sync(path.resolve(basePath, fileObj.pattern));
  var retVal = []; // Array of file objects, one for each file
  var onlyTargets = true;   
  for (var i = 0; i < files.length; i++) {
    var singleFile = {
        pattern: files[i].replace(basePath + '/', ''),
        included: !targetsMap[files[i]]
    };
    if (!targetsMap[files[i]]) {
      onlyTargets = false;
    }
    for (var prop in fileObj) {
      if ((prop != 'pattern') && (prop != 'included')) {
        singleFile[prop] = fileObj[prop];
      }
    }
    retVal.push(singleFile);
  }
  if (onlyTargets) {
    fileObj.included = false;
    return fileObj;
  }
  return retVal;
}

function createRedirectPreprocessor(logger, basePath, proxies, files,
    preprocessors, config, masterConfig) {

  if (proxies === undefined) {
    masterConfig.proxies = proxies = {};
  }

  config = typeof config === 'object' ? config : {};

  var targetGlobs = Object.keys(preprocessors).filter(function(pattern) {
    return preprocessors[pattern] == 'redirect' || (
        Array.isArray(preprocessors[pattern]) &&
        preprocessors[pattern].indexOf('redirect') != -1);
  });
  var targets = getTargetsMap(basePath, files, targetGlobs);

  // Don't include redirected files by default
  if (config.dontInclude !== false) {
    for (var i = 0; i < files.length; i++) {
      var newFile = unincludeTargets(basePath, files[i], targets, targetGlobs);
      if (Array.isArray(newFile)) {
        files.splice.apply(files, [i, 1].concat(newFile));
        i += newFile.length - 1;
      } else {
        files[i] = newFile;
      }
    }
  }

  // Compute information for redirect
  var log = logger.create('preprocessor.redirect');
  var stripPrefix = new RegExp('^' + (config.stripPrefix || ''));
  var prependPrefix = config.prependPrefix || '';
  var stripSufix = new RegExp((config.stripSuffix || config.stripSufix || '') + '$');
  var cacheIdFromPath = config && config.cacheIdFromPath || function(filepath) {
    return prependPrefix + filepath.replace(stripPrefix, '').replace(stripSufix, '');
  };

  // Do the redirect
  for (var file in targets) {
    log.debug('Processing "%s".', file);

    var originalPath = file.replace(basePath + '/', '');
    var newPath = cacheIdFromPath(originalPath);

    proxies['/' + newPath] = '/base/' + originalPath;
  }

  // Return a dummy preprocessor
  return function(content, file, done) {
    done(content);
  };
}

createRedirectPreprocessor.$inject = ['logger', 'config.basePath',
    'config.proxies', 'config.files', 'config.preprocessors',
    'config.redirectPreprocessor', 'config'];

module.exports = createRedirectPreprocessor;
