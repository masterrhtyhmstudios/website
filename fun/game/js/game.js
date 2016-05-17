var json = {
    title: "Whole Note aka Semi-Breeve.",
    description: "Why do some notes have two names? Terms like this come from Latin and Italian. They can be useful to know - and worry not, you will remember it in time!",
    lines: [
        "16:R---,----,----,----L---,----,----,----R---,----,----,----L---,----,----,----",
        "16:R---,----,----,----L---,----,----,----R---,----,----,----L---,----,----,----"
    ],
    repeat: false,
    images: [
        {p: 1, l: 1},
        {p: 1, l: 2},
    ]
};

var startedLoading = false;
var exercise = getUrlVars()['exercise'];
console.log("Playing: Exercise " +exercise);
var images = {};
var lines = [];
var imagesToLoad = 0;
var audioToLoad = 0;
var audio = {};

var drumEvents = [];
var metronomeEvents = [];
var startTime = 0;

var playing = false;
var repeat = false;

var keycodes = {
  RIGHT: 39,
  LEFT: 37,
  P: 80,
  Q: 81
};

var lineCount = 0;

var canvas;
var ctx;
var leftGradRight;
var rightGradRight;
var leftGradWrong;
var rightGradWrong;

var generateGradients = function() {
  leftGradRight = ctx.createLinearGradient(0, 0, canvas.width*0.5, 0);
  leftGradRight.addColorStop(0,"rgba(0, 255, 0, 1)");
  leftGradRight.addColorStop(1,"rgba(0, 255, 0, 0)");

  leftGradWrong = ctx.createLinearGradient(0, 0, canvas.width*0.5, 0);
  leftGradWrong.addColorStop(0,"rgba(255, 0, 0, 1)");
  leftGradWrong.addColorStop(1,"rgba(255, 0, 0, 0)");

  rightGradRight = ctx.createLinearGradient(canvas.width-canvas.width*0.5, 0, canvas.width, 0);
  rightGradRight.addColorStop(0,"rgba(0, 255, 0, 0)");
  rightGradRight.addColorStop(1,"rgba(0, 255, 0, 1)");

  rightGradWrong = ctx.createLinearGradient(canvas.width-canvas.width*0.5, 0, canvas.width, 0);
  rightGradWrong.addColorStop(0,"rgba(255, 0, 0, 0)");
  rightGradWrong.addColorStop(1,"rgba(255, 0, 0, 1)");
};

window.onresize = function() {
  generateGradients();
};

window.onload = function() {
  if (exercise === undefined) {
    console.log('oi!');
    document.getElementById('exTitle').innerHTML = 'Please select an exercise! Redirecting to menu...';
    window.location = '../game';
  } else {
    if (exercise > 1) {
      document.getElementById('prevBtnHref').href = '?exercise='+(exercise-1).toString();
      console.log("oi");
    } else {
      document.getElementById('prevBtnBtn').disabled = true;
    }
    if (exercise < 15) {
      console.log("uh");
      document.getElementById('nextBtnHref').href = '?exercise='+(parseInt(exercise)+1).toString();
    } else {
      document.getElementById('nextBtn').disabled = true;
      // document.getElementById('nextBtnHref').style.display = 'none';
    }
    console.log('?exercise='+(parseInt(exercise)+1).toString());

    document.getElementById('buttonHUD').style.display = 'block';
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    $('#canvas').click(function(e) {
        window.location = $('#element-under-canvas').attr('href');
    });

    generateGradients();

    window.addEventListener("keydown", function(e){ 
      if (e.keyCode == keycodes.P) {
        addDrumHit('R');
      }

      if (e.keyCode == keycodes.Q) {
        addDrumHit('L');
      }
    });

    window.addEventListener('touchstart', function(e) {
      var touch = e.touches[0];
      if (touch.pageX < window.innerWidth/2) {
        addDrumHit('L');
      } else {
        addDrumHit('R');
      }
    });

    console.log("assets/exercises/ex"+exercise.toString()+".json");
    $.getJSON( "assets/exercises/ex"+exercise.toString()+".json", function( data ) {
      console.log(data);

      repeat = data.repeat;
      document.getElementById('exNumber').innerHTML = "Exercise: " +exercise.toString();
      document.getElementById('exTitle').innerHTML = data.title;
      document.getElementById('exDesc').innerHTML = data.description;

      lineCount = data.images.length;
      imagesToLoad = data.images.length;
      startedLoading = true;

      loadAudio();
      loadLines(data.lines, barTime, data.repeat);
      loadImages(data.images);

      window.requestAnimationFrame(step);
    });
  }
};

var rewind = function() {
  console.log("rewind");
};

var paused = false;
var pause = function() {
  if (!recording) {
    console.log("pause");
    paused = !paused;
  }
};

var play = function() {
  console.log("play");
  playLines(lines, 0, false, true, true);
  paused = false;
};

var stop = function() {
  console.log("stop");
  console.trace();
  drumEvents = [];
  metronomeEvents = [];
  playing = false;
  recording = false;
  for (var i = 0; i < lines.length; i++) {
      console.log('line' +i.toString());
      document.getElementById('line'+i.toString()).style.opacity = 1;
  }
};

var recording = false;
var record = function() {
  console.log("record");
  playLines(lines, 0, true, true, true);
  paused = false;
  recording = true;
};

var addedImages = false;
var update = function() {
  canvas.width = $(window).width();
  canvas.height = document.body.scrollHeight;
  // console.log("updating canvas height");
  if (startedLoading) {
    if (imagesToLoad <= 0 && audioToLoad <= 0) {
      //Finished loading!
      if (!addedImages) {
        for (var i = 0; i < lineCount; i++) {
          console.log(images['line'+i][0].outerHTML);
          images['line'+i].appendTo('#game-area');
        };
        generateGradients();
        addedImages = true;
      }
      loadedState();
    } else {
      loadingState();
    }
  }
}

var playLines = function(l, startIndex, recording, intro, whole) {
  if (!playing) {
    ticksPlayed = 0;
    var toplay = [];
    if (intro) {
      toplay.push({
        line: 'intro',
        beatarray: ['-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-'],
        intro: true
      });
    }
    for (var i = 0; i < l.length; i++) {
      toplay.push({line: i+startIndex, beatarray: l[i].beatArray, intro: false});
    };

    if (whole && repeat) {
      for (var i = 0; i < l.length; i++) {
        toplay.push({line: i+startIndex, beatarray: l[i].beatArray, intro: false});
      };
    }

    console.log(toplay);
    console.log("beat interval is " + barTime);

    var beatInterval = barTime/16;
    var beats = l[0].beats;
    var counter = 0;
    patience = beatInterval/2;
    console.log("patience is " +patience);

    for (var i = 0; i < toplay.length; i++) {
      console.log(toplay[i].beatarray);
      for (var j = 0; j < toplay[i].beatarray.length; j++) {
        var tp = toplay[i].beatarray[j];
        if (tp == 'R' || tp == 'L') {
          drumEvents.push({
            time: counter*beatInterval,
            drum: tp,
            line: toplay[i].line,
            recording: recording
          });
        }

        if (counter%(beats/4) == 0) {
          metronomeEvents.push({
            time: counter*beatInterval,
            drum: '-',
            line: toplay[i].line,
            intro: toplay[i].intro ? 4 - counter/4 : null
          });
        }

        counter++;
      }
    }

    console.log(drumEvents.length);
    console.log(metronomeEvents.length);

    startTime = getTimestamp();
    playing = true;
  } else {
    //Loop through drum and metronome event arrays.
  }
};

var drumImages = {
  left: {
    alpha: 0,
    fillStyle: leftGradRight
  },

  right: {
    alpha: 0,
    fillStyle: rightGradRight
  }
}

//Canvas animations.
var drumHit = function(good, left) {
  if (good) {
    goodhits++;
  } else {
    badhits++;
  }

  console.log("Percentage: " + (goodhits/(goodhits+badhits))*100);
  if (left) {
    // drumImages.left.fillStyle = good ? leftGradRight : leftGradWrong;
    drumImages.left.fillStyle = good ? "#00ff00" : "#ff0000";
    drumImages.left.alpha = 0.75;
  } else {
    // drumImages.right.fillStyle = good ? rightGradRight : rightGradWrong;
    drumImages.right.fillStyle = good ? "#00ff00" : "#ff0000";
    drumImages.right.alpha = 0.75;
  }
};

var countDownText = null;
var showCountDown = function(number) {
  countDownText = {
    string: number.toString(),
    x: 25,
    y: 25,
    alpha: 1
  };
};

var updateCanvas = function() {
  drumImages.left.alpha -= 0.025;
  if (drumImages.left.alpha < 0) {
    drumImages.left.alpha = 0;
  }

  drumImages.right.alpha -= 0.025;
  if (drumImages.right.alpha < 0) {
    drumImages.right.alpha = 0;
  }

  // ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ff0000";
  ctx.fillStyle = drumImages.left.fillStyle;
  ctx.globalAlpha = drumImages.left.alpha;
  ctx.fillRect(0, 0, canvas.width*0.25, canvas.height);

  ctx.fillStyle = drumImages.right.fillStyle;
  ctx.globalAlpha = drumImages.right.alpha;
  ctx.fillRect(canvas.width*0.75, 0, canvas.width*0.25, canvas.height);

  //draw countdown text.
  ctx.fillStyle = "#000000";
  if (countDownText != null) {
    countDownText.alpha -= 0.1;
    ctx.globalAlpha = countDownText.alpha;
    if (countDownText.alpha < 0) {
      countDownText.alpha = 0;
      countDownText = null;
    } else {
      var fontSize = Math.floor(window.innerHeight * 0.5);
      ctx.textAlign = 'center';
      ctx.font= fontSize+"px Times New Roman";
      ctx.fillText(countDownText.string, canvas.width*0.5, document.body.scrollTop + window.innerHeight*0.75);
    }
  }
};

var clickLine = function(index) {
  stop();
  playLines([lines[index]], index, false, true, false);
};

var playDrum = function(drum) {
  if (drum == 'R') {
    drumHit(true, false);
    playWebAudioFile('assets/audio/tom1.wav');
  } else if (drum == 'L') {
    drumHit(true, true);
    playWebAudioFile('assets/audio/tom1.wav');
  } else if (drum == '-') {
    playWebAudioFile('assets/audio/hat.wav');
  }
};

var goodhits = 0;
var badhits = 0;

var lastUserDrumHit = null;
var lastScheduledDrumHit = null;
var patience = 50;
var lastHitBefore = false;
var barLength = 0;
var addDrumHit = function(drum) {
  if (drum == 'L') {
    playWebAudioFile('assets/audio/tom1.wav');
  } else {
    playWebAudioFile('assets/audio/tom1.wav');
  }

  if (recording) {
    var hitTime = getTimestamp() - startTime;
    console.log(drum);
    if (drumEvents.length > 0 && (drumEvents[0].time - hitTime) < patience) {
      if (drum == drumEvents[0].drum) {
        drumHit(true, drum == 'L');
        lastHitBefore = true;
        console.log("good! time was ahead by " + (drumEvents[0].time - hitTime));
      } else {
        // stop();
        drumHit(false, drum == 'L');
        console.log("Wrong drum, dummy!");
      }
    } else if (lastScheduledDrumHit != null && (hitTime - lastScheduledDrumHit.time) < patience) {
        if (drum == lastScheduledDrumHit.drum) {
          drumHit(true, drum == 'L');
          console.log("good! time was behind by " + (hitTime - lastScheduledDrumHit.time));
          lastScheduledDrumHit = null;
        } else {
          // stop();
          drumHit(false, drum == 'L');
          console.log("Wrong drum, dummy!");
        }
    } else {
      // stop();
      drumHit(false, drum == 'L');
    }
  } else {
    drumHit(true, drum == 'L');
  }
};

var registerDrum = function(drum) {
  lastScheduledDrumHit = drum;
  console.log("registering a drum: ");
  console.log(drum);
};

var loadingState = function() {
  
};

var ticksPlayed = 0;
var loadedState = function() {
  if (playing) {
    if (!paused) {
      var stillDrums = false;

      if (lastScheduledDrumHit != null) {
        if (!lastHitBefore && (getTimestamp() - lastScheduledDrumHit.time > patience)) {
          console.log("you missed!");
          lastScheduledDrumHit = null;
          // stop();
        }
      }

      if (drumEvents.length > 0) {
        stillDrums = true;
        if (getTimestamp() - startTime > drumEvents[0].time) {
          if (drumEvents[0].recording) {
            registerDrum(drumEvents.shift());
          } else {
            playDrum(drumEvents.shift().drum);
          }
          playedDrum = true;
        }
      }

      var stillMetronome = false;
      if (metronomeEvents.length > 0) {
        stillMetronome = true;
        ticksPlayed++;
        if (getTimestamp() - startTime > metronomeEvents[0].time) {
          for (var i = 0; i < lines.length; i++) {
            if (i == metronomeEvents[0].line && i != 'intro') {
              document.getElementById('line'+i.toString()).style.opacity = 1;
            } else {
              if (i == metronomeEvents[0].line - 1 && i != 'intro' && metronomeEvents[0].line < lineCount-1) {
                //This is the next line, fade it in.

              }

              document.getElementById('line'+i.toString()).style.opacity = 0.5;
            }
          };
          if (metronomeEvents[0].line != 'intro') {
            document.getElementById('line' +metronomeEvents[0].line).opacity = 1;
            //Scroll to next line
          }

          if ((metronomeEvents[0].intro) != null) {
            showCountDown(metronomeEvents[0].intro);
          }
          playDrum(metronomeEvents.shift().drum);
          playedMetronome = true;
        }
      }

      if (!(stillDrums || stillMetronome)) {
        for (var i = 0; i < lines.length; i++) {
            document.getElementById('line'+i.toString()).style.opacity = 1;
        }
        recording = false;
        playing = false;
      }

      lastTime = getTimestamp();
    } else {
      startTime += getTimestamp() - lastTime;
      lastTime = getTimestamp();
    }
  }
};

var step = function() {
  update();
  updateCanvas();
  window.requestAnimationFrame(step);
};