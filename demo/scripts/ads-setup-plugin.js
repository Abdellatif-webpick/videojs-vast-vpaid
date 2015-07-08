var _ = require('./utils');
var messages = require('./messages');

module.exports = function molVastSetup(opts) {
  var player = this;
  var options = _.extend({}, this.options_, opts);

  var vastAd = player.vastClient({
    url: getAdsUrl,
    playAdAlways: true,
    adCancelTimeout: options.adCancelTimeout || 3000,
    adsEnabled: !!options.adsEnabled
  });

  player.on('reset', function () {
    if (player.options().plugins['ads-setup'].adsEnabled) {
      vastAd.enable();
    } else {
      vastAd.disable();
    }
  });

  player.on('vast.aderror', function(evt) {
    var error = evt.error;

    if(error && error.message) {
      messages.error(error.message);
    }
  });

  /**** Local functions ******/
  function getAdsUrl() {
    return options.adsTag;
  }
};
