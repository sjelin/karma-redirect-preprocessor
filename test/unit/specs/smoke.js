var makeConfig = require('../helper/makeConfig');
var runWithConfig = require('../helper/runWithConfig');

describe('smoke tests', function() {
  it('should return an identity preprocessor', function(done) {
    var contents = 'Hello, World!';
    runWithConfig(makeConfig([], []))(contents, null, function(x) {
      expect(x).toBe(contents);
      done();
    });
  });
  it('should do nothing if there are no targets', function() {
    var config = makeConfig(['*.txt'], []);
    config.proxies = {}; // It might add an empty proxies object though
    var configStr = JSON.stringify(config);
    runWithConfig(config);
    expect(JSON.stringify(config)).toBe(configStr); // Bad test - JSON.stringify
                                                    // may change ordering
  });
  it('should add proxies for redirected files', function() {
    var config = makeConfig(['a.txt', 'b.txt'], ['b.txt']);
    runWithConfig(config);
    expect(JSON.stringify(config.proxies)).toBe('{"/b.txt":"/base/b.txt"}');
  });
  it('should not include files being redirected by default', function() {
    var config = makeConfig(['a.txt', 'b.txt'], ['b.txt']);
    runWithConfig(config);
    expect(config.files[1].included).toBe(false);
  });
  it('should not include files being redirected by default', function() {
    var config = makeConfig(['a.txt', 'b.txt'], ['b.txt'],
        {dontInclude: false});
    runWithConfig(config);
    expect(config.files[1].included).toBe(undefined);
  });
});
