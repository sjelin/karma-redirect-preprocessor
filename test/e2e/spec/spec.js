describe('e2e', function() {
  it('shouldn\'t include scripts touched by karma-redirect', function() {
    expect(!!window.SHOULD_NOT_BE_SET).toBe(false);
  });

  it('should get file from new URL', function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'file.js', false);
    xhr.send();
    expect(xhr.status).toBe(200);
  });
});
