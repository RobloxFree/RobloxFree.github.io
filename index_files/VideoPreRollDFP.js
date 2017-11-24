if (typeof Roblox == "undefined") {
    Roblox = {};
}

Roblox.VideoPreRollDFP = {
    newValue: '',
    showVideoPreRoll: false,
    videoInitialized: false, // this.start has run
    videoStarted: false,
    videoCompleted: false,
    videoSkipped: false,
    videoCancelled: false,
    videoErrored: false,
    loadingBarMaxTime: 30000,
    loadingBarCurrentTime: 0,
    loadingBarIntervalID: 0,
    loadingBarID: "videoPrerollLoadingBar",
    loadingBarInnerID: "videoPrerollLoadingBarCompleted",
    loadingBarPercentageID: "videoPrerollLoadingPercent",
    videoDiv: "videoPrerollMainDiv",
    companionAdDiv: "videoPrerollCompanionAd",
    contentElement: "contentElement",
    videoLoadingTimeout: 7000,
    videoPlayingTimeout: 23000,
    videoLogNote: "",  // if blank, assume this was successful
    logsEnabled: false,
    excludedPlaceIds: "",
    isSwfPreloaderEnabled: false,
    isFlashInstalled: false,
    isPrerollShownEveryXMinutesEnabled: false,

    adUnit: "", //  /1015347/VideoPreroll
    adTime: 0,

    customTargeting: {
        userAge: "",
        userGender: "",
        gameGenres: "",
        environment: "",
        adTime: "",
        placeID: typeof play_placeId === "undefined" ? "" : play_placeId,
        PLVU: false,
    },

    adsManager: null,
    adsLoader: null,
    adDisplayContainer: null,
    intervalTimer: null,

    videoContent: null,       

    contentEndedListener: function contentEndedListener() { adsLoader.contentComplete(); },

    createVideoContent: function createVideoContent() {
        Roblox.VideoPreRollDFP.videoContent = document.getElementById(this.contentElement);
    },

    createAdDisplayContainer: function createAdDisplayContainer() {
        adDisplayContainer =
            new google.ima.AdDisplayContainer(
                document.getElementById(this.videoDiv),
                Roblox.VideoPreRollDFP.videoContent);
    },

    requestAds: function requestAds() {
        // Enable VPAID 2
        google.ima.settings.setVpaidAllowed(true);

        this.createVideoContent();
        this.createAdDisplayContainer();

        adDisplayContainer.initialize();

        adsLoader = new google.ima.AdsLoader(adDisplayContainer);
        adsLoader.addEventListener(
            google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            this.onAdsManagerLoaded,
            false);
        adsLoader.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            this.onAdError,
            false);

        this.videoContent.addEventListener('ended', this.contentEndedListener);

        // Request video ads.
        var adsRequest = new google.ima.AdsRequest();

        // construct tag url
        var tagUrl = this.constructUrl();
        adsRequest.adTagUrl = tagUrl;

        // Specify the linear and nonlinear slot sizes. This helps the SDK to
        // select the correct creative if multiple are returned.
        adsRequest.linearAdSlotWidth = 400;
        adsRequest.linearAdSlotHeight = 300;

        adsRequest.nonLinearAdSlotWidth = 400;
        adsRequest.nonLinearAdSlotHeight = 300;

        adsLoader.requestAds(adsRequest);
    },
    
    constructUrl: function constructUrl() {
        var baseUrl = "http://pubads.g.doubleclick.net/gampad/ads?impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&url=[referrer_url]&description_url=[description_url]&correlator=[timestamp]";
        var size = "&sz=400x300";
        var iu = "&iu=" + this.adUnit;
        var companionSize = "&ciu_szs=300x250";
        var customTag = encodeURIComponent("Env=" + this.customTargeting.environment
                                          + "&Gender=" + this.customTargeting.userGender
                                          + "&Age=" + this.customTargeting.userAge
                                          + "&Genres=" + this.customTargeting.gameGenres
                                          + "&PlaceID=" + this.customTargeting.placeID
                                          + "&Time=" + this.customTargeting.adTime
                                          + "&PLVU=" + this.customTargeting.PLVU);
        var url = baseUrl + size + iu + companionSize + "&cust_params=" + customTag + "&";
        return url;
    },

    onAdsManagerLoaded: function onAdsManagerLoaded(adsManagerLoadedEvent) {
        adsManager = adsManagerLoadedEvent.getAdsManager(Roblox.VideoPreRollDFP.videoContent);  //See API reference for contentPlayback
        
        adsManager.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            Roblox.VideoPreRollDFP.onAdError);
        adsManager.addEventListener(
            google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
            Roblox.VideoPreRollDFP.onAdEvent);
        adsManager.addEventListener(
            google.ima.AdEvent.Type.LOADED,
            Roblox.VideoPreRollDFP.onAdEvent);
        adsManager.addEventListener(
            google.ima.AdEvent.Type.STARTED,
            Roblox.VideoPreRollDFP.onAdEvent);
        adsManager.addEventListener(
            google.ima.AdEvent.Type.SKIPPED,
            Roblox.VideoPreRollDFP.onAdEvent);
        adsManager.addEventListener(
            google.ima.AdEvent.Type.COMPLETE,
            Roblox.VideoPreRollDFP.onAdEvent);

        try {
            adsManager.init(400, 300, google.ima.ViewMode.NORMAL);
            adsManager.start();
        } catch (adError) {
            Roblox.VideoPreRollDFP.onAdError();
        }
    },

    onAdEvent: function onAdEvent(adEvent) {
        switch (adEvent.type) {
            case google.ima.AdEvent.Type.LOADED:
                // This is the first event sent for an ad
                break;
            case google.ima.AdEvent.Type.STARTED:
                Roblox.VideoPreRollDFP.videoStarted = true;
                // Get the ad from the event.
                var ad = adEvent.getAd();
                // Get a list of companion ads for an ad slot size and CompanionAdSelectionSettings
                var companionAds = ad.getCompanionAds(300, 250);
                if (companionAds.length > 0) {
                    var companionAd = companionAds[0];
                    // Get HTML content from the companion ad.
                    var content = companionAd.getContent();
                    // Write the content to the companion ad slot.
                    var div = document.getElementById(Roblox.VideoPreRollDFP.companionAdDiv);
                    div.innerHTML = content;
                }
                break;
            case google.ima.AdEvent.Type.SKIPPED:
                Roblox.VideoPreRollDFP.videoCompleted = true;
                Roblox.VideoPreRollDFP.videoSkipped = true;
                Roblox.VideoPreRollDFP.showVideoPreRoll = false;
                break;
            case google.ima.AdEvent.Type.COMPLETE:
                if (Roblox.VideoPreRollDFP.videoStarted) {
                    if (Roblox.VideoPreRollDFP.videoCancelled == false) {
                        // video played to completion (or was skipped)
                        Roblox.VideoPreRollDFP.videoCompleted = true;
                        Roblox.VideoPreRollDFP.showVideoPreRoll = false;
                        if (Roblox.VideoPreRollDFP.newValue != '') {
                            $.cookie("RBXVPR", Roblox.VideoPreRollDFP.newValue, 180);            
                        }
                    }
                }
                break;
        }
    },

    onAdError: function onAdError(adErrorEvent) {
        // Handle the error logging.
        Roblox.VideoPreRollDFP.videoCompleted = true;
        Roblox.VideoPreRollDFP.videoErrored = true;
        // console.log(adErrorEvent.getError());
        Roblox.VideoPreRollDFP.videoLogNote = "AdError";
    },


    checkEligibility: function checkEligibility() {
        if (Roblox.VideoPreRollDFP.showVideoPreRoll) {
            if (Roblox.VideoPreRollDFP.checkFlashEnabled()) {
                Roblox.VideoPreRollDFP.isFlashInstalled = true;
            }
            if ($("#PlaceLauncherStatusPanel").data("is-protocol-handler-launch-enabled") != "True" && !Roblox.Client.IsRobloxInstalled()) {  // we're not on protocol handler and Roblox is not installed
                Roblox.VideoPreRollDFP.showVideoPreRoll = false;
            }
            else if (Roblox.Client.isIDE()) {  // is Studio, check this before player
                Roblox.VideoPreRollDFP.videoLogNote = "RobloxStudio";
                Roblox.VideoPreRollDFP.showVideoPreRoll = false;
            }
            else if (Roblox.Client.isRobloxBrowser()) {  // is Player
                Roblox.VideoPreRollDFP.videoLogNote = "RobloxPlayer";
                Roblox.VideoPreRollDFP.showVideoPreRoll = false;
            }
            else if ((window.chrome || window.safari) && window.location.hash == '#chromeInstall')  // during chrome install
            {
                Roblox.VideoPreRollDFP.showVideoPreRoll = false;
            }
        }
    },

    checkFlashEnabled: function checkFlashEnabled() {
        var hasFlash = false;
        try {
            var flash = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            if (flash) {
                hasFlash = true;
            }
        } catch (e) {
            if (navigator.mimeTypes 
                && navigator.mimeTypes['application/x-shockwave-flash'] != undefined
                && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
                hasFlash =true;
            }
        }
        return hasFlash;
    },

    isExcluded: function isExcluded(placeId) {
        // placeId is only submitted from protocol handler.  use global play_placeId instead
        if (typeof placeId == "undefined" && typeof play_placeId !== "undefined") {
            placeId = play_placeId;
        }
        if (Roblox.VideoPreRollDFP.showVideoPreRoll && Roblox.VideoPreRollDFP.excludedPlaceIds !== "") {
            var excludedPlaceIdArr = Roblox.VideoPreRollDFP.excludedPlaceIds.split(",");
            if (typeof placeId !== "undefined") {
                for (var i = 0; i < excludedPlaceIdArr.length; i++) {
                    if (placeId == excludedPlaceIdArr[i]) {
                        Roblox.VideoPreRollDFP.videoLogNote = "ExcludedPlace";
                        return true;
                    }
                }
            }
        }
        return false;
    },

    start: function start() {
        // flip state bits
        this.videoInitialized = true;
        this.videoStarted = false;
        this.videoCancelled = false;
        this.videoCompleted = false;
        this.videoSkipped = false;
        this.loadingBarCurrentTime = 0;
        this.videoLogNote = "";

        var loadingBarInterval = 1000;

        // Start loading bar
        LoadingBar.init(this.loadingBarID, this.loadingBarInnerID, this.loadingBarPercentageID);
        this.loadingBarIntervalID = setInterval(function () {
            Roblox.VideoPreRollDFP.loadingBarCurrentTime += loadingBarInterval;
            LoadingBar.update(Roblox.VideoPreRollDFP.loadingBarID, Roblox.VideoPreRollDFP.loadingBarCurrentTime / Roblox.VideoPreRollDFP.loadingBarMaxTime);
        }, loadingBarInterval);

        // Fetch preroll ad
        if (this.isSwfPreloaderEnabled && this.isFlashInstalled) {
            this.renderImaPreloader();
        }
        else {
            this.requestAds();
        }
    },

    cancel: function cancel() {
        this.videoCancelled = true;
        $.modal.close();  // calls this.close()
    },
    skip: function skip() {
        this.videoCompleted = true;
        this.videoSkipped = true;
        this.showVideoPreRoll = false;
    },

    close: function close() {
        if (MadStatus.running) {
            MadStatus.stop("");
        }
        if (RobloxLaunch.launcher) {
            RobloxLaunch.launcher._cancelled = true;
        }
        clearInterval(this.loadingBarIntervalID);
        LoadingBar.dispose(this.loadingBarID);

        if (this.isPlaying()) {
            // closing before video ended, must be a cancel
            this.videoCancelled = true;
        }

        $.modal.close();
        this.logVideoPreRoll();

        // Update preroll count
        if (this.isPrerollShownEveryXMinutesEnabled && this.videoInitialized && this.videoCompleted) {
            this.updatePrerollCount();
        }
    },

    // -------------google analysis fire
    logVideoPreRoll: function logVideoPreRoll() {
        if (!Roblox.VideoPreRollDFP.logsEnabled) {
            return; // logs disabled
        }
        var category = "";
        if (Roblox.VideoPreRollDFP.videoCompleted) { // Also encompasses timeouts
            category = "Complete";
            if (Roblox.VideoPreRollDFP.videoLogNote == "") {
                Roblox.VideoPreRollDFP.videoLogNote = "NoTimeout";
            }
            // log only once per page load
            Roblox.VideoPreRollDFP.logsEnabled = false;
        }
        else if (Roblox.VideoPreRollDFP.videoCancelled) {
            category = "Cancelled";
            Roblox.VideoPreRollDFP.videoLogNote = RobloxLaunch.state;
        }
        else if (Roblox.VideoPreRollDFP.videoInitialized == false && Roblox.VideoPreRollDFP.videoLogNote != "") {
            category = "Failed";
            // log only once per page load
            Roblox.VideoPreRollDFP.logsEnabled = false;
        }
        else {
            return;  // nothing to report
        }
        GoogleAnalyticsEvents.FireEvent(["DFPPreRoll", category, Roblox.VideoPreRollDFP.videoLogNote]);

    },
    isPlaying: function isPlaying() {
        if (!Roblox.VideoPreRollDFP.videoInitialized) {
            return false;
        }

        // if video is not loaded post timeout, consider the video complete
        if (Roblox.VideoPreRollDFP.videoInitialized
                && !Roblox.VideoPreRollDFP.videoStarted
                && Roblox.VideoPreRollDFP.loadingBarCurrentTime > Roblox.VideoPreRollDFP.videoLoadingTimeout) {
            Roblox.VideoPreRollDFP.videoCompleted = true;
            Roblox.VideoPreRollDFP.videoLogNote = "LoadingTimeout";

        }
        // if video is waaay too long, consider the video complete
        if (Roblox.VideoPreRollDFP.videoStarted && !Roblox.VideoPreRollDFP.videoCompleted
                && Roblox.VideoPreRollDFP.loadingBarCurrentTime > Roblox.VideoPreRollDFP.videoPlayingTimeout) {
            Roblox.VideoPreRollDFP.videoCompleted = true;
            Roblox.VideoPreRollDFP.videoLogNote = "PlayingTimeout";
        }

        return !Roblox.VideoPreRollDFP.videoCompleted;
    },
    correctIEModalPosition: function correctIEModalPosition(dialog) {
        if (dialog.container.innerHeight() <= 30) {  // gives a little style buffer.  should really be around 15px;
            // this must be IE (or equally stupid).  shift the modal up.
            var innerContainer = $("#videoPrerollPanel");
            var shiftDistance = -Math.floor(innerContainer.innerHeight() / 2);
            innerContainer.css({ position: "relative", top: shiftDistance + "px" });
            dialog.container.find(".VprCloseButton").css({ top: (shiftDistance - 10) + "px", "z-index": "1003" });
        }
    },

    // Copied from VideoPreRoll.js. It's for testing.
    test: function openVideoPreroll2(options) {
        _popupOptions = {
            escClose: true,
            opacity: 80,
            overlayCss: { backgroundColor: "#000" },
            onShow: function (dialog) {
                //Roblox.VideoPreRollDFP.correctIEModalPosition(dialog);
                //Roblox.VideoPreRollDFP.start();
                Test.VideoPreRollDFP.start();
                $('#prerollClose').hide();
                $('#prerollClose').delay(1000 * Roblox.VideoPreRollDFP.adTime).show(300);
            },
            onClose: function (dialog) { Roblox.VideoPreRollDFP.close(); },
            closeHTML: '<a href="#" class="ImageButton closeBtnCircle_35h ABCloseCircle VprCloseButton"></a>'
        };
        $("#videoPrerollPanel").modal(_popupOptions);
        // Madlib status
        if (!MadStatus.running) {
            MadStatus.init($("#videoPrerollPanel").find('.MadStatusField'), $("#videoPrerollPanel").find('.MadStatusBackBuffer'), 2000, 800);
            MadStatus.start();
        }
        $("#videoPrerollPanel").find('.MadStatusStarting').css("display", 'none');
        $("#videoPrerollPanel").find('.MadStatusSpinner').css("visibility", ((status === 3 || status === 4 || status === 5) ? 'hidden' : 'visible'));
    },

    renderImaPreloader: function renderImaPreloader() {
        var adUrl = encodeURIComponent(Roblox.VideoPreRollDFP.constructUrl());
        var adTagUrl = "adTagUrl=" + adUrl;
        $.get("/game/preloader",
              { Url: adTagUrl },
              function (data) {
                  $("#videoPrerollMainDiv").html(data);
                  if (!Roblox.VideoPreRollDFP.videoErrored) {
                      Roblox.VideoPreRollDFP.videoStarted = true;
                  }
              });
    },

    updatePrerollCount: function updatePrerollCount() {
        $.get("/game/updateprerollcount");
    }
};

var LoadingBar = {
    bars: [],
    init: function loadingBarInit(barID, innerBarID, percentageID, percentComplete) {
        var newBar = this.get(barID);
        if (newBar == null) {
            newBar = {}; 
        }
        newBar.barID = barID;
        newBar.innerBarID = innerBarID;
        newBar.percentageID = percentageID;
        if (typeof percentComplete == "undefined") {
            newBar.percentComplete = 0; // value from 0 to 1
        }
        this.bars.push(newBar);
        this.update(barID, newBar.percentComplete);
    },
    get: function loadingBarGet(barID) {
        for (var i = 0; i < this.bars.length; i++) {
            if (this.bars[i].barID == barID) {
                return this.bars[i];
            }
        }
        return null;
    },
    dispose: function loadingBarDispose(barID) {
        for (var i = 0; i < this.bars.length; i++) {
            if (this.bars[i].barID == barID) {
                this.bars.splice(i, 1);
            }
        }
    },
    update: function loadingBarUpdate(barID, percentComplete) {
        var bar = this.get(barID);
        if (!bar) {
            return;
        }
        if (percentComplete > 1) {
            percentComplete = 1;
        }
        var maxWidth = $("#" + barID).width();
        var innerBarWidth = Math.round(maxWidth * percentComplete);
        //$("#" + bar.innerBarID).width(innerBarWidth);
        $("#" + bar.innerBarID).animate({width: innerBarWidth}, 200, "swing");
        if (bar.percentageID && $("#" + bar.percentageID).length > 0) {
            $("#" + bar.percentageID).html(Math.round(percentComplete * 100) + "%");
        }
        bar.percentComplete = percentComplete;
    }
};

