var makeConfig = require('../helper/makeConfig');
var runWithConfig = require('../helper/runWithConfig');

function getFileByPattern(files, pattern) {
  return files.filter(function(file) {
    return (file.pattern || file) == pattern;
  })[0];
}

describe('edge case tests', function() {
  it('should expand globs in proxies', function() {
    var config = makeConfig(['a*c.txt'], ['a*c.txt']);
    runWithConfig(config);
    expect(config.proxies['/ac.txt']).not.toBe(undefined);
    expect(config.proxies['/abc.txt']).not.toBe(undefined);
    expect(Object.keys(config.proxies).length).toBe(2);
  });
  it('should ignore other preprocessors', function() {
    var config = makeConfig(['a.txt'], []);
    config.preprocessors['a.txt'] = ['cpp'];
    runWithConfig(config);
    expect(JSON.stringify(config.proxies)).toBe('{}');
  });
  it('should preserve properties on file objects', function() {
    var config = makeConfig([{
      pattern: 'a.txt',
      hello: 'world'
    }], ['a.txt']);
    runWithConfig(config);
    expect(config.files[0].hello).toBe('world');
  });
  it('should not bother with files matching preprocessor glob but no file glob',
    function() {
      var config = makeConfig(['a.txt'], ['*.txt']);
      runWithConfig(config);
      expect(Object.keys(config.proxies).length).toBe(1);
    }
  );
  it('should not try to un-include a file which is already not included',
    function() {
      var config = makeConfig([{
        pattern: '*.txt',
        included: false
      }], ['a.txt'], {});
      runWithConfig(config);
      expect(config.files[0].pattern).toBe('*.txt');
      expect(config.files.length).toBe(1);
    }
  );
  it('should un-include a file pattern which matches a preprocessor glob',
    function() {
      var config = makeConfig(['a*.txt'], ['a*.txt']);
      runWithConfig(config);
      expect(config.files[0].pattern).toBe('a*.txt');
      expect(config.files[0].included).toBe(false);
      expect(config.files.length).toBe(1);
    }
  );
  it('should not un-include a file who\'s pattern matches no preprocessor' +
      ' targets', function() {
    var config = makeConfig(['a*.txt'], ['b*.txt']);
    runWithConfig(config);
    expect(config.files[0]).toBe('a*.txt');
    expect(config.files.length).toBe(1);
  });
  it('should split file pattern if only some need to be un-included',
    function() {
      var config = makeConfig(['ab*.txt'], ['abc.txt']);
      runWithConfig(config);
      expect(config.files.length).toBe(2);
      var ab = getFileByPattern(config.files, 'ab.txt');
      var abc = getFileByPattern(config.files, 'abc.txt');
      expect(ab.pattern || ab).toBe('ab.txt');
      expect(ab.included).not.toBe(false);
      expect(abc.pattern).toBe('abc.txt');
      expect(abc.included).toBe(false);
    }
  );
  it('should not split a file pattern if every matches file is a redirected',
    function() {
      var config = makeConfig(['ab*.txt'], ['abc.txt', 'ab.txt']);
      runWithConfig(config);
      expect(config.files.length).toBe(1);
      expect(config.files[0].pattern).toBe('ab*.txt');
      expect(config.files[0].included).toBe(false);
    }
  );
  it('should transfer file properties to split versions', function() {
    var config = makeConfig([{
      pattern: 'ab*.txt',
      hello: 'world'
    }], ['abc.txt']);
    runWithConfig(config);
    expect(config.files[0].hello).toBe('world');
    expect(config.files[1].hello).toBe('world');
  });
  it('should work in complex case', function() {
    var f0 = {pattern: 'a*.txt'};
    var f1 = {pattern: 'b*.txt'};
    var f2 = {pattern: 'c*.txt'};
    var config = makeConfig([f0, f1, f2], ['a*.txt', 'ba*.txt']);
    runWithConfig(config);
    // Should have split f1
    expect(config.files.indexOf(f1)).toBe(-1);
    expect(config.files.length).toBe(7);
    // Should preserve order
    expect(config.files[0]).toBe(f0);
    expect(config.files[config.files.length-1]).toBe(f2);
    // Should handle f0 and f2 correctly
    expect(f0.included).toBe(false);
    expect(f2.included).toBe(undefined);
    // Should handle f1 correctly
    expect(getFileByPattern(config.files, 'b.txt').included).not.toBe(false);
    expect(getFileByPattern(config.files, 'bc.txt').included).not.toBe(false);
    expect(getFileByPattern(config.files, 'bca.txt').included).not.toBe(false);
    expect(getFileByPattern(config.files, 'ba.txt').included).toBe(false);
    expect(getFileByPattern(config.files, 'bac.txt').included).toBe(false);
    // Should create proxies
    expect(Object.keys(config.proxies).length).toBe(7);
    expect(config.proxies['/a.txt']).not.toBe(undefined);
    expect(config.proxies['/ab.txt']).not.toBe(undefined);
    expect(config.proxies['/abc.txt']).not.toBe(undefined);
    expect(config.proxies['/ac.txt']).not.toBe(undefined);
    expect(config.proxies['/acb.txt']).not.toBe(undefined);
    expect(config.proxies['/ba.txt']).not.toBe(undefined);
    expect(config.proxies['/bac.txt']).not.toBe(undefined);
  });
});
