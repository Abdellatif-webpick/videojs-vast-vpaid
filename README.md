# videojs-vast-plugin
[![Build Status](https://travis-ci.org/MailOnline/videojs-vast-vpaid.svg?branch=master)](https://travis-ci.org/MailOnline/videojs-vast-vpaid)
[![Code Climate](https://codeclimate.com/github/MailOnline/videojs-vast-vpaid/badges/gpa.svg)](https://codeclimate.com/github/MailOnline/videojs-vast-vpaid)
[![Test Coverage](https://codeclimate.com/github/MailOnline/videojs-vast-vpaid/badges/coverage.svg)](https://codeclimate.com/github/MailOnline/videojs-vast-vpaid/coverage)

  This plugin allows videojs to monetise its videos. To do so, it implements the [VAST](http://www.iab.net/media/file/VASTv3.0.pdf) and [VPAID](http://www.iab.net/media/file/VPAID_2.0_Final_04-10-2012.pdf) specifications from IAB.
  
  Currently we support VAST and VPAID Flash preroll ads. 
  We are working to support VPAID HTML5 preroll ads, and we will add more VAST ad types as we need them.
  
  It is important to notice that **VPAID integration is still in beta** and we have not yet released a stable version.
  
  You can find a demo of the plugin working together with video.js [here](http://mailonline.github.io/videojs-vast-vpaid)

## Integration with video.js
  To integrate the plugin with videoJs you need to:
  
  1.- Add the videoJs to your page script and stylesheed to your page after you have added video js
  ```
  <link href="http://vjs.zencdn.net/4.12/video-js.css" rel="stylesheet">
  <script src="http://vjs.zencdn.net/4.12/video.js"></script>
  ```
  2.- Add the plugin to your page
  ```
  <link href="/path/to/videojs-vast-plugin.css" rel="stylesheet">
  <script src="/path/to/videojs-vast-plugin.min.js"></script>
  ```
  3.- Create you own ads plugin to pass an add media tag to the plugin
  
  Below you have a simple ads-setup-plugin
    
  ```javascript
  vjs.plugin('ads-setup', function (opts) {
    var player = this;
    var adsCancelTimeout = 3000;
  
    var vastAd = player.vastClient({
      //Media tag URL
      url: "http://pubads.g.doubleclick.net/gampad/ads?env=....",
      playAdAlways: true,
      //Note: As requested we set the preroll timeout at the same place thant the adsCancelTimeout
      adCancelTimeout: adsCancelTimeout,
      adsEnabled: !!options.adsEnabled
    });
  });
  ```
  
  You can also configure the vast plugin using the data-setup attribute
  
```html
  <video id="example_video_1" class="video-js vjs-default-skin"
         controls preload="auto" width="640" height="264"
         poster="http://video-js.zencoder.com/oceans-clip.png"
         data-setup='{
                  "plugins": {
                          "vast":{
                              "url": "http://pubads.g.doubleclick.net/gampad/ads?env=....",
                              "adsCancelTimeout": 5000,
                              "adsEnabled": true
                          }
                  }
             }'>
      <source src="http://video-js.zencoder.com/oceans-clip.mp4" type='video/mp4'/>
      <source src="http://video-js.zencoder.com/oceans-clip.webm" type='video/webm'/>
      <source src="http://video-js.zencoder.com/oceans-clip.ogv" type='video/ogg'/>
      <p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a
              href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>
  </video>
```
  
## Options
  
### url
  >Use it to pass the ad media tag, it can be a string containing the Media tag url
  >
  >##### Hardcoded Media Tag
  >
  > var vastAd = player.vastClient({
  >   url: "http://pubads.g.doubleclick.net/gampad/ads?env=....",
  >  ...
  > });
  >
  >
  >or a function that will return the Media tag whenever called
  >
  >
  >#####  Dynamic Media Tag
  >```javascript
  >var vastAd = player.vastClient({
  >url: getAdsUrl,
  > ...
  >});
  >
  >function getAdsUrl() {
  >      return "http://pubads.g.doubleclick.net/gampad/ads?env=....";
  >}
  >```
  >On initialization, the plugin well call the function and store the returned Media tag to request the VAST/VPAID ads.
  
### playAdAlways
  >Flag to indicate if we must play an ad whenever possible. If set to true the plugin will play an ad every time the user watches a new video or replays the actual video.
  >Defaults to false
  
## adCancelTimeout
 >Number of milliseconds for the ad to start before canceling it. Defaults to 3000
 
## adsEnabled
 >Flag to disable the ads. Defaults to false.
 
## Returned object
 An invocation to ```player.vastClient({...})``` returns and object that with some helper functions that allow you to dynamically enable or disable the vast plugin, or check if it is enabled.
  ```javascript
  var vastPlugin = player.vastClient({
     url: getAdsUrl,
     playAdAlways: true,
     //Note: As requested we set the preroll timeout at the same place thant the adsCancelTimeout
     adCancelTimeout: adsCancelTimeout,
     adsEnabled: !!options.adsEnabled
   });
    
   player.on('reset', function () {
       if (!vastPlugin.isEnabled()) {
         vastPlugin.enable();
       } vastPlugin {
         vastAd.disable();
       }
   });
  ```
  
### isEnabled
  >This function returns true if the player is enabled and false otherwise.
  
### enable
  >Enables the VAST plugin
  
### disable
  >Disables the plugin
 
## player.vast
  The returned object described above it is also published as a player property so that you can use it anywhere as long as you have access to the player instance.
  ```javascript
     player.vastClient({
       url: getAdsUrl,
       playAdAlways: true,
       //Note: As requested we set the preroll timeout at the same place thant the adsCancelTimeout
       adCancelTimeout: adsCancelTimeout,
       adsEnabled: !!options.adsEnabled
     });
      
     player.on('reset', function () {
         if (!player.vast.isEnabled()) {
           player.vast.enable();
         } vastPlugin {
           player.vast.disable();
         }
     });
  ```
  
## License
videojs-vast-plugin is licensed under the MIT License, Version 2.0. [View the license file](LICENSE)

Copyright (c) 2015 MailOnline
