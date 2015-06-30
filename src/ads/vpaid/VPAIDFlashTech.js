function VPAIDFlashTech(mediaFile) {
  if (!(this instanceof VPAIDFlashTech)) {
    return new VPAIDFlashTech(mediaFile);
  }
  sanityCheck(mediaFile);
  this.mediaFile = mediaFile;
  this.containerEl = null;
  this.vpaidFlashClient = null;

  /*** local functions ***/
  function sanityCheck(mediaFile) {
    if (!mediaFile || !isString(mediaFile.src)) {
      throw new VASTError('on VPAIDFlashTech, invalid MediaFile');
    }
  }
}

VPAIDFlashTech.supports = function (type) {
  return type === 'application/x-shockwave-flash';
};

VPAIDFlashTech.prototype.loadAdUnit = function loadFlashCreative(containerEl, callback) {
  var that = this;
  sanityCheck(containerEl, callback);

  this.containerEl = containerEl;
  this.vpaidFlashClient = new VPAIDFLASHClient(containerEl, function (error) {
    if (error) {
      return callback(error);
    }

    that.vpaidFlashClient.loadAdUnit(that.mediaFile.src, callback);
  });

  /*** Local Functions ***/
  function sanityCheck(container, cb) {

    if (!dom.isDomElement(container)) {
      throw new VASTError('on VPAIDFlashTech.loadAdUnit, invalid dom container element');
    }

    if (!isFunction(cb)) {
      throw new VASTError('on VPAIDFlashTech.loadAdUnit, missing valid callback');
    }
  }
};

VPAIDFlashTech.prototype.unloadAdUnit = function () {
  if (this.vpaidFlashClient) {
    try{
      this.vpaidFlashClient.destroy();
    } catch(e){
      if(console && isFunction(console.log)){
        console.log('VAST ERROR: trying to unload the VPAID adunit');
      }
    }
    this.vpaidFlashClient = null;
  }

  if (this.containerEl) {
    dom.remove(this.containerEl);
    this.containerEl = null;
  }
};
