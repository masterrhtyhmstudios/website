//Audio
var audioMode;
audioMode = (window.AudioContext || window.webkitAudioContext) ? "webAudio" : "htmlAudio";
if (audioMode == "webAudio") {
    audioContext = new (window.AudioContext || window.webkitAudioContext) ();
}

console.log("Audio mode: " +audioMode);

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
    });
    return vars;
}

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame  = window[vendors[x]+'CancelAnimationFrame'] 
                                    || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

function loadImages(data) {
	for (var i = 0; i < data.length; i++) {

		var toLoad = data[i];
        var imgPath = 'assets/images/lines/p'+toLoad.p+'/l'+(toLoad.l)+'.jpg';
        console.log("loading from " +imgPath);
        $('<img id="line'+i.toString()+'" onclick="clickLine('+i.toString()+')" class="musicLine" src="'+ imgPath +'">').load(function(event) {
            console.log(event.target.id);
            var img = $(this)[0];
            var w = img.width;
            var h = img.height;

            var ratio = h/w;
            var width = window.innerWidth - 32;
            var height = width * ratio;

            images[event.target.id] = $(this);
            imagesToLoad--;
        });
	};
}

function loadWebAudioFile(path, callback) {
    var request;
    audio[path] = {};
    request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
        if(request.status == 200 || request.status == 206) {
            audioContext.decodeAudioData(request.response, function(buffer) {
                audio[path] = buffer;
                callback();
            });
        } else {
            console.log("Audio file not found " + request.status);
        }
    }
    request.send();
}

function playWebAudioFile(path) {
    var source = audioContext.createBufferSource();
    if(!source.start && !!source.noteOn) source.start = source.noteOn; // legacy stuff, don't worry
    source.buffer = audio[path];
    source.connect(audioContext.destination);
    source.start(0);
}

function loadAudio() {
    audioToLoad = 3;
    loadWebAudioFile('assets/audio/tom1.wav', function() {
        audioToLoad--;
    });

    loadWebAudioFile('assets/audio/tom3.wav', function() {
        audioToLoad--;
    });

    loadWebAudioFile('assets/audio/hat.wav', function() {
        audioToLoad--;
    });
}

function loadLines(data, time, repeat) {
	for (var i = 0; i < data.length; i++) {
		var toLoad = data[i];
		var parsed = parseInput(toLoad, time, repeat);
        lines[i] = parsed;
        barLength = time;

        console.log("Loaded and parsed line " +(i+1).toString() +"!");
	};
}

var getTimestamp;
if (window.performance.now) {
    console.log("Using high performance timer");
    getTimestamp = function() { return window.performance.now(); };
} else {
    if (window.performance.webkitNow) {
        console.log("Using webkit high performance timer");
        getTimestamp = function() { return window.performance.webkitNow(); };
    } else {
        console.log("Using low performance timer");
        getTimestamp = function() { return new Date().getTime(); };
    }
}