var makeConfig = require('../helper/makeConfig');
var runWithConfig = require('../helper/runWithConfig');

function testTransform(config, ab, ac, ba, bc, ca, cb) {
  var config = makeConfig(['ab.txt', 'ac.txt', 'ba.txt', 'bc.txt', 'ca.txt',
      'cb.txt'], ['*.txt'], config);
  runWithConfig(config);
  expect(Object.keys(config.proxies).length).toBe(6);
  for(var i = 1; i < arguments.length; i++) {
    expect(config.proxies['/' + arguments[i]]).not.toBe(undefined);
  }
}

describe('rewrite tests', function() {
  it('should handle stripPrefix', function() {
    testTransform({stripPrefix: 'a'}, 'b.txt', 'c.txt', 'ba.txt', 'bc.txt',
        'ca.txt', 'cb.txt');
  });
  it('should handle stripSufix', function() {
    testTransform({stripSufix: 'a.txt'}, 'ab.txt', 'ac.txt', 'b', 'bc.txt', 'c',
        'cb.txt');
  });
  it('should handle prependPrefix', function() {
    testTransform({prependPrefix: 'x/'}, 'x/ab.txt', 'x/ac.txt', 'x/ba.txt',
        'x/bc.txt', 'x/ca.txt', 'x/cb.txt');
  });
  it('should handle cacheIdFromPath', function() {
    testTransform({cacheIdFromPath: function(path) {
          return path[1]+path[0];
        }}, 'ba', 'ca', 'ab', 'cb', 'ac', 'bc');
  });
});
