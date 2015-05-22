var path = require('path');
var pkg = require('../package.json');
var parseArgs = require('minimist');

var knownOptions = {
  string: 'env',
  default: {env: process.env.NODE_ENV || 'development'}
};

var options = parseArgs(process.argv.slice(2), knownOptions);
module.exports = {
  env: options.env,

  //Files needed to build the demo
  demo: {
    pages: [
      'demo/tpls/demo.html'
    ],
    styles: [
      'bower_components/video.js/dist/video-js/video-js.css',
      'demo/styles/*.css'
    ],

    assets: [
      'demo/assets/*'
    ],

    fonts: [
      'bower_components/video.js/dist/video-js/font/*'
    ],

    scripts: [
      'node_modules/es5-shim/es5-shim.js', //Required for the player to work on old browsers
      'bower_components/video.js/dist/video-js/video.dev.js',
      'demo/scripts/**/*.js'
    ]
  },

  //Vendor files
  vendor: {
    scripts: [
      'bower_components/swfobject/swfobject/src/swfobject.js',
      'bower_components/flashVPAID/bin/VPAIDFlashToJS.js',
      'bower_components/videojs-contrib-ads/src/videojs.ads.js'
    ],
    sourcemaps: [
      'bower_components/flashVPAID/bin/VPAIDFlashToJS.js.map'
    ],
    styles: [
      //Empty for the moment
    ],
    assets: [
      'bower_components/flashVPAID/bin/VPAIDFlash.swf'
    ],
    fonts: [
      //Empty for the moment
    ]
  },

  plugin: {
    scripts: [
      'src/utils/pollyfill.js',
      'src/utils/utilityFunctions.js',
      'src/utils/**/*.js',
      'src/**/*.js'
    ],
    styles: [
      'src/**/*.css'
    ],
    tests: {
      unit: [
        'test/test-utils.js',
        'test/**/*.js'
      ]
    }
  },

  //App files for production
  prodfile: {
    scripts: pkg.name + '.js',
    styles: pkg.name + '.css'
  },

  //Dist folder
  DIST: path.normalize('__dirname/../dist'),
  DEV: path.normalize('__dirname/../dev')
};