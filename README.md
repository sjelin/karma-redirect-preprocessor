# karma-redirect-preprocessor

> Preprocessor for serving files at custom URLs

In your code, you might have a line like:
```js
$.ajax('templates/landing.html').done(function(html) {
  loadView(html);
});
```
However, when running this code in Karma, `landing.html` will probably be served
to a URL like `/base/static/templates/landing.html`, in which case the above
AJAX won't work.

The `karma-redirect-preprocessor` can solve this problem by making karma serve
files at the correct URL.

Based off of [karma-ng-html2js-preprocessor](https://github.com/karma-runner/karma-ng-html2js-preprocessor).

## Installation

The easiest way is to keep `karma-redirect-preprocessor` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "karma": "~0.10",
    "karma-redirect-preprocessor": "~0.1"
  }
}
```

You can simple do it by:
```bash
npm install karma-redirect-preprocessor --save-dev
```

Compatible with karma 0.13 and above

## Configuration
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    preprocessors: {
      '**/*.html': ['redirect']
    },

    files: [
      '*.js',
      '*.html',
      '*.html.ext',
      // if you wanna load template files in nested directories, you must use this
      '**/*.html'
    ],

    // if you have defined plugins explicitly, add karma-redirect-preprocessor
    // plugins: [
    //     <your plugins>
    //     'karma-redirect-preprocessor',
    // ]

    redirectPreprocessor: {
      // strip this from the file path
      stripPrefix: 'public/',
      stripSuffix: '.ext',
      // prepend this to the
      prependPrefix: 'served/',

      // or define a custom transform function
      cacheIdFromPath: function(filepath) {
        return cacheId;
      },

      // By default, any redirected files have their `included` property set to
      // false (see "How does it work?").  If you set dontInclude to false
      // however, the preprocessor will not mess with the `included` property.
      // dontInclude = false
    }
  });
};
```


## How does it work ?

This preprocessor rewrites your config file so that files are proxied to the
desired address.  See the [config documentation](http://karma-runner.github.io/0.13/config/configuration-file.html)
for information on proxies in karma.  By default, the preprocessor also sets the
[`included` property ](http://karma-runner.github.io/0.13/config/files.html) of
all redirected files to `false`.  This stops karma from including the files in
`<script>` tags, since the tests will probably be retrieving these files over
AJAX (and the files might not even be `js` files).

See the [test file](/test/e2e/karma.conf.js) for an example.

----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
