(function () {
  'use strict';

  var range_AZ = _.range(65, 65 + 26)
      .map(function (i) {return String.fromCharCode(i); }),
    range_az = _.range(97, 97 + 26)
      .map(function (i) {return String.fromCharCode(i); }),
    letterStates = [],
    letter,
    i,
    current,
    playing = document.getElementById("audio_z"),
    letterLine = document.getElementById("letters"),
    hint,
    colors = ['#EC438E', '#50B1D8', '#1CCF2A', '#EF394B', '#F08F07',
              '#F4EA39', '#AB00D8'], //, '#FF6801', '#EC438E', '', '', ''],
    ignored = {},
    orderBtn = document.getElementById("order"),
    pianoNotes =
      { a: "C4",
        b: "C4",
        c: "G4",
        d: "G4",
        e: "A4",
        f: "A4",
        g: "G4",
        h: "F4",
        i: "F4",
        j: "E4",
        k: "E4",
        l: "D4",
        m: "D4",
        n: "D4",
        o: "D4",
        p: "C4",
        q: "G4",
        r: "G4",
        s: "F4",
        t: "E4",
        u: "E4",
        v: "D4",
        w: "G4",
        x: "F4",
        y: "E4",
        z: "D4"},
    voices = {},
    voice = document.getElementById("voice"),
    canPlayMultiple = false;


  
  function LetterState(i, letter, audioId) {
    this.i = i;
    this.letter = letter;
    this.audioId = audioId;
  }

  function LetterErrorState(letter, audioId, next) {
    this.letter = letter;
    this.audioId = audioId;
    this.next = next;
  }

  for (i = 0; i < 26; i = i + 1) {
    letter = String.fromCharCode(97 + i);
    letterStates[i] = new LetterState(i, letter, "audio_" + letter);
  }
  for (i = 1; i < letterStates.length;  i = i + 1) {
    letterStates[i - 1].next = letterStates[i];
  }
  letterStates[letterStates.length - 1].next = letterStates[0];

  current = letterStates[0];

  function fixLetterLine() {
    while (letterLine.scrollWidth > letterLine.offsetWidth) {
      letterLine.innerHTML = letterLine.innerHTML.substring(1);
    }
  }

  LetterState.prototype.displayNext = function () {
    letterLine.innerHTML = letterLine.innerHTML + '<span style="color:' +
      _.sample(colors) + '">' + this.letter.toUpperCase() + '</span>' +
      " ";
    fixLetterLine();
  };
  
  LetterState.prototype.cutAndPlayNext = function () {
    var last = playing;
    playing = document.getElementById(this.audioId);
    last.pause();
    playing.play();
    // back to beginning for next play
    last.load();
  };
  
  LetterState.prototype.playNext = LetterState.prototype.cutAndPlayNext;
  
  LetterState.prototype.PlayNextNoCut = function () {
    playing = document.getElementById(this.audioId);
    playing.play();
  };
  
  LetterState.prototype.onRightLetter = function () {
    this.playNext();
    current = this.next;
    letterLine.innerHTML = letterLine.innerHTML + '<span style="color:' +
      _.sample(colors) + '">' + this.letter.toUpperCase() + '</span>' +
      " ";
    fixLetterLine();
  };
  
  function createIdPlayer(id) {
    return function () {
      document.getElementById(id).play();
    };
  }
  
  LetterState.prototype.onDigit = function (n) {
    var start = Math.max(0, this.i - n),
      iLetter;
    for (iLetter = start; iLetter < this.i - 1; iLetter = iLetter + 1) {
      document.getElementById("audio_" + String.fromCharCode(97 + iLetter)).onended =
        createIdPlayer("audio_" + String.fromCharCode(97 + iLetter + 1));
    }
    document.getElementById("audio_" + String.fromCharCode(97 + start)).play();
  };

  LetterState.prototype.onWrongLetter = function () {
    hint = document.createElement("span");
    hint.id = "hint";
    hint.style.color = "LightGray";
    var hintText = document.createTextNode(this.letter.toUpperCase());
    hint.appendChild(hintText);
    letterLine.appendChild(hint);
    fixLetterLine();
    current = new LetterErrorState(this.letter, this.audioId, this.next);
  };

  LetterState.prototype.onLetter = function (letter) {
    if (this.letter ===  letter) {
      this.onRightLetter();
    } else {
      this.onWrongLetter();
    }
  };

  LetterErrorState.prototype = Object.create(LetterState.prototype);

  function testMultiplePlaying() {
    var test1 = document.getElementById("test1"),
      test2 = document.getElementById("test2"),
      counter = 0;
    [test1, test2].forEach(function (audio) {
      audio.addEventListener('loadedmetadata', function () {
        audio.volume = 0;
        audio.play();
      }, false);
      audio.addEventListener('playing', function () {
        counter = counter + 1;
        if (counter === 2) {
          canPlayMultiple = true;
          LetterState.prototype.playNext = LetterState.prototype.PlayNextNoCut;
        }
      }, false);
    });
    test1.src = "mp3/piano/audiocheck.net_C4.mp3";
    test2.src = "mp3/piano/audiocheck.net_C4.mp3";
  }
  
  testMultiplePlaying();
  
  LetterErrorState.prototype.onRightLetter = function () {
    letterLine.removeChild(document.getElementById("hint"));
    LetterState.prototype.onRightLetter.call(this);
  };

  LetterErrorState.prototype.onWrongLetter = function () {
    hint.style.color = "gray";
  };

  function onLetter(letter) {
    current.onLetter(letter);
  }
  function onKey(e) {
    var letter = e.key || String.fromCharCode(e.keyCode);
    if (!(ignored.hasOwnProperty(letter))) {
      ignored[letter] = true;
      onLetter(letter);
    }
  }

  window.addEventListener("keypress", onKey, false);

  function onKeyUp(e) {
    var letter = e.key || String.fromCharCode(e.keyCode);
    if (ignored.hasOwnProperty(letter)) {
      delete ignored[letter];
    }
  }

  window.addEventListener("keyup", onKeyUp, false);

  document.getElementById("restart").onclick = function () {
    letterLine.innerHTML = "";
    current = letterStates[0];
  };

  function setOnKeyClick() {
    [].forEach.call(document.getElementById("keys").children,
      function (key) {
        var letter = key.innerHTML.substring(0, 1).toLowerCase();
        key.onmousedown = function (e) {
          onLetter(letter);
        };
      });
  }
  setOnKeyClick();

  document.getElementById("swap").onclick = function () {
    var i = Math.floor(Math.random() * 25),
      key = document.getElementById("keys").children.item(i);
    key.parentNode.insertBefore(key.nextSibling, key);
  };

  orderBtn.onclick = function () {
    document.getElementById("keys").innerHTML =
      _.map(_.range(26),
            function (i) {
          return '<button class="key">' + String.fromCharCode(i + 65) + "</button>";
        }).join("");
    setOnKeyClick();
  };
  
  // initial letter buttons display
  orderBtn.onclick();
  
  function setupDigits() {
    document.getElementById("digits").innerHTML =
      _.map(_.range(1, 9),
        function (i) {
          return '<span class="digit">' + i + "</span> ";
        }).join("");
  }
  
  setupDigits();

  document.getElementById("shuffle").onclick = function () {
    var i;
    for (i = 0; i < 40; i = i + 1) {
      document.getElementById("swap").onclick();
    }
  };
  
  function loadVoice(fLoadLetterFile) {
    range_az.forEach(function (letter) {
      var audio = document.getElementById("audio_" + letter);
      audio.src = fLoadLetterFile(letter);
      audio.load();
    });
  }
  
  function loadPiano() {
    loadVoice(function (letter) {
      return "mp3/piano/audiocheck.net_" + pianoNotes[letter] + ".mp3";
    });
  }

  function loadSinger() {
    loadVoice(function (letter) {
      return "mp3/singer/" + letter.toUpperCase() + ".mp3";
    });
  }
  voices.loadPiano = loadPiano;
  voices.loadSinger = loadSinger;
  
  loadPiano();
  
  voice.onchange = function () {
    voices[voice.value]();
  };
  

}());
