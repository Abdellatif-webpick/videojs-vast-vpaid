describe("VASTTracker", function () {
  var response, ASSET_URI;

  function createTrackEvent(eventName, uri) {
    var trackingXML = '<Tracking event="' + eventName + '">' +
      '<![CDATA[' + uri + ']]>' +
      '</Tracking>';
    return new TrackingEvent(xml.toJXONTree(trackingXML));
  }

  beforeEach(function () {
    response = new VASTResponse();
    response._addDuration(100000);// <== 100 seconds
    ASSET_URI = 'http://ASSET_URI';
  });

  it("must be a function", function () {
    assert.isFunction(VASTTracker);
  });

  it("must return an instance of itself", function () {
    assert.instanceOf(VASTTracker(ASSET_URI, response), VASTTracker);
  });

  it("must throw an error if you don't pass an asset URI to the constructor", function () {
    assert.throws(function () {
      new VASTTracker();
    }, VASTError, 'VAST Error: on VASTTracker constructor, missing required the URI of the ad asset being played');
  });

  it("must throw an error if you don't pass a VASTResponse obj to the constructor", function () {
    assert.throws(function () {
      new VASTTracker(ASSET_URI);
    }, VASTError, 'VAST Error: on VASTTracker constructor, missing required VAST response');
  });

  describe("instance", function () {
    var origTrack;

    function assertVASTTrackRequest(URLs, variables) {
      URLs = isArray(URLs) ? URLs : [URLs];
      sinon.assert.calledWithExactly(vastUtil.track, URLs, variables);
    }

    beforeEach(function () {
      origTrack = vastUtil.track;
      vastUtil.track = sinon.spy();
    });

    afterEach(function () {
      vastUtil.track = origTrack;
    });

    it("must publish the response", function () {
      var tracker = new VASTTracker(ASSET_URI, response);
      assert.equal(tracker.response, response);
    });

    it("must publish the assetUri passed to the constructor", function () {
      var tracker = new VASTTracker(ASSET_URI, response);
      assert.equal(tracker.assetURI, ASSET_URI);
    });

    it("must set the progress to 0 at start", function () {
      var tracker = new VASTTracker(ASSET_URI, response);
      assert.equal(tracker.progress, 0);
    });

    it("must publish the quartiles using the duration set on the vastResponse", function () {
      response._addDuration(10000);
      var tracker = new VASTTracker(ASSET_URI, response);
      assert.deepEqual(tracker.quartiles, {
        firstQuartile: 2500,
        midpoint: 5000,
        thirdQuartile: 7500
      });
    });

    describe("trackURLs", function(){
      var tracker;

      beforeEach(function(){
        tracker = new VASTTracker(ASSET_URI, response);
      });

      it("must be a function", function(){
        assert.isFunction(tracker.trackURLs);
      });

      it("must add ASSETURI and CONTENTPLAYHEAD to the tracking variables", function(){
        tracker.trackURLs(['http://sample.track.url']);
        assertVASTTrackRequest(['http://sample.track.url'], {
          ASSETURI: ASSET_URI,
          CONTENTPLAYHEAD: "00:00:00.000"
        });
      });

      it("must track the passed urls with he passed variables", function(){
        tracker.trackURLs(['http://sample.track.url'], {FOOVAR: 'FOOVAR'});
        assertVASTTrackRequest(['http://sample.track.url'], {
          ASSETURI: ASSET_URI,
          CONTENTPLAYHEAD: "00:00:00.000",
          FOOVAR: 'FOOVAR'
        });
      });

      it("must not track anything if the passed urls is not an array with urls", function(){
        tracker.trackURLs([], {FOOVAR: 'FOOVAR'});
        tracker.trackURLs({}, {FOOVAR: 'FOOVAR'});
        tracker.trackURLs(null, {FOOVAR: 'FOOVAR'});
        tracker.trackURLs(undefined, {FOOVAR: 'FOOVAR'});
        sinon.assert.notCalled(vastUtil.track);
      });
    });

    describe("trackEvent", function () {
      var tracker;

      beforeEach(function () {
        response._addTrackingEvents([
          createTrackEvent('start', 'http://start.trackEvent.url'),
          createTrackEvent('close', 'http://close.trackEvent.url'),
          createTrackEvent('firstQuartile', 'http://firstQuartile.trackEvent.url')
        ]);
        tracker = new VASTTracker(ASSET_URI, response);
      });

      it("must be a function", function () {
        assert.isFunction(tracker.trackEvent);
      });

      it("must track the passed event", function () {
        tracker.trackEvent('start');
        assertVASTTrackRequest(['http://start.trackEvent.url'], {ASSETURI: ASSET_URI, CONTENTPLAYHEAD: "00:00:00.000"});

        tracker.progress = 120;
        tracker.trackEvent('close');
        assertVASTTrackRequest(['http://close.trackEvent.url'], {ASSETURI: ASSET_URI, CONTENTPLAYHEAD: "00:00:00.120"});
      });

      it("must not track anything if the tracker is not tracking the passed event", function () {
        tracker.trackEvent('fooEvent');
        sinon.assert.notCalled(vastUtil.track);
      });

      it("must be possible to mark an track event as track one.", function () {
        tracker.trackEvent('start', true);
        assertVASTTrackRequest(['http://start.trackEvent.url'], {ASSETURI: ASSET_URI, CONTENTPLAYHEAD: "00:00:00.000"});

        assert.isUndefined(tracker.response.trackingEvents.start);

        vastUtil.track.reset();
        tracker.trackEvent('start');
        sinon.assert.notCalled(vastUtil.track);
      });
    });

    describe("trackProgress", function () {
      var tracker;

      beforeEach(function () {
        var progressEvent = createTrackEvent('progress', 'http://progress.track.url');
        progressEvent.offset = 100;
        response._addTrackingEvents([
          createTrackEvent('start', 'http://start.track.url'),
          createTrackEvent('rewind', 'http://rewind.track.url'),
          createTrackEvent('firstQuartile', 'http://firstQuartile.track.url'),
          createTrackEvent('midpoint', 'http://midpoint.track.url'),
          createTrackEvent('thirdQuartile', 'http://thirdQuartile.track.url'),
          progressEvent
        ]);
        tracker = new VASTTracker(ASSET_URI, response);
        sinon.spy(tracker, 'trackEvent');
      });

      it("must be a function", function () {
        assert.isFunction(tracker.trackProgress);
      });

      it("must set the progress in the tracker", function () {
        tracker.trackProgress(124324);
        assert.equal(tracker.progress, 124324);
      });

      it("must not set the progress if you don't pass an number for the progress", function () {
        tracker.trackProgress();
        tracker.trackProgress(null);
        tracker.trackProgress('foo');
        tracker.trackProgress([]);
        tracker.trackProgress({});
        assert.equal(tracker.progress, 0);
      });

      it("must track start event whenever the progress becomes bigger that 0 for the first time.", function () {
        tracker.trackProgress(1);
        sinon.assert.calledWithExactly(tracker.trackEvent, 'start', true);
      });

      it("must track the rewind event if the new progress is smaller than the current one", function () {
        tracker.trackProgress(10);
        tracker.trackEvent.reset();

        tracker.trackProgress(5);
        sinon.assert.calledWithExactly(tracker.trackEvent, 'rewind', false);
      });

      it("must track the quartile event if the progress is bigger than the quartile time by on second at most", function () {
        tracker.trackEvent.reset();

        //FirstQuartile
        tracker.trackProgress(10000);// <== 10 seconds
        sinon.assert.neverCalledWith(tracker.trackEvent, 'firstQuartile', true);
        tracker.trackProgress(25000);//<== 25 seconds
        sinon.assert.calledWithExactly(tracker.trackEvent, 'firstQuartile', true);

        //midPoint
        tracker.trackProgress(35000);// <== 35 seconds
        sinon.assert.neverCalledWith(tracker.trackEvent, 'midpoint', true);
        tracker.trackProgress(50000);//<== 50 seconds
        sinon.assert.calledWithExactly(tracker.trackEvent, 'midpoint', true);

        //thirdQuartile
        tracker.trackProgress(65000);// <== 65 seconds
        sinon.assert.neverCalledWith(tracker.trackEvent, 'thirdQuartile', true);
        tracker.trackProgress(75500);//<== 75.5 seconds
        sinon.assert.calledWithExactly(tracker.trackEvent, 'thirdQuartile', true);
      });

      it("must trigger the progress event after the specified offset has passed", function(){
        tracker.trackProgress(95);
        sinon.assert.neverCalledWith(tracker.trackEvent, 'progress', true);
        tracker.trackProgress(100);
        sinon.assert.calledWithExactly(tracker.trackEvent, 'progress', true);
      });
    });

    ['fullscreen', 'exitFullscreen', 'complete', 'pause', 'resume', 'close', 'closeLinear', 'skip', 'mute', 'unmute'].forEach(function (eventName) {
      var fnName = 'track' + capitalize(eventName);
      describe(fnName, function(){
        var tracker;

        beforeEach(function () {
          tracker = new VASTTracker(ASSET_URI, response);
          sinon.spy(tracker, 'trackEvent');
        });

        it("must be a function", function(){
          assert.isFunction(tracker[fnName]);
        });

        it("must track the '" + eventName + "' event", function(){
          tracker[fnName]();
          sinon.assert.calledWithExactly(tracker.trackEvent, eventName);
        });
      });
    });

    describe("trackErrorWithCode", function(){
      var tracker;

      beforeEach(function () {
        response._addErrorTrackUrl('http://error.track.url');
        tracker = new VASTTracker(ASSET_URI, response);
      });

      it("must be a function", function(){
        assert.isFunction(tracker.trackErrorWithCode);
      });

      it("must track the passed error code", function(){
        tracker.trackErrorWithCode(101);
        assertVASTTrackRequest(['http://error.track.url'], {
          ASSETURI: ASSET_URI,
          CONTENTPLAYHEAD: "00:00:00.000",
          ERRORCODE: 101
        });
      });

      it("must not track anything if you don't pass a valid error code", function(){
        tracker.trackErrorWithCode('1224');
        tracker.trackErrorWithCode(null);
        tracker.trackErrorWithCode({});
        tracker.trackErrorWithCode();
        sinon.assert.notCalled(vastUtil.track);
      });
    });
    
    describe("trackImpressions", function(){
      var tracker;

      beforeEach(function () {
        response._addImpressions(['http://impressions.track.url']);
        tracker = new VASTTracker(ASSET_URI, response);
      });

      it("must be a function", function(){
        assert.isFunction(tracker.trackImpressions)
      });

      it("must track the impressionURLs", function(){
        tracker.trackImpressions();
        assertVASTTrackRequest(['http://impressions.track.url'], {
          ASSETURI: ASSET_URI,
          CONTENTPLAYHEAD: "00:00:00.000"
        })
      });
    });

    describe("trackClick", function(){
      var tracker;

      beforeEach(function () {
        response._addClickTrackings(['http://click.track.url']);
        tracker = new VASTTracker(ASSET_URI, response);
      });

      it("must be a function", function(){
        assert.isFunction(tracker.trackClick);
      });

      it("must track the clickTracking URLS", function(){
        tracker.trackClick();
        assertVASTTrackRequest(['http://click.track.url'], {
          ASSETURI: ASSET_URI,
          CONTENTPLAYHEAD: "00:00:00.000"
        });
      });
    });
  });
});