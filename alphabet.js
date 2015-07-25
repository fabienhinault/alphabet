(function () {
  'use strict';

  var letterStates = [],
    letter,
    i,
    current,
    playing = document.getElementById("audio_z"),
    letterLine = document.getElementById("letters"),
    hint,
    colors = ['#EC438E', '#50B1D8', '#1CCF2A', '#EF394B', '#F08F07',
              '#F4EA39', '#AB00D8'], //, '#FF6801', '#EC438E', '', '', ''],
    ignored = {};

  function LetterState(letter, audioId) {
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
    letterStates[i] = new LetterState(letter, "audio_" + letter);
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

  LetterState.prototype.onRightLetter = function () {
    var last = playing;
    playing = document.getElementById(this.audioId);
    last.pause();
    playing.play();
    last.load();
    // assert this === current;
    current = this.next;
    letterLine.innerHTML = letterLine.innerHTML + '<span style="color:' +
      _.sample(colors) + '">' + this.letter.toUpperCase() + '</span>' +
      " ";
    fixLetterLine();
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

  LetterErrorState.prototype.onRightLetter = function () {
    letterLine.removeChild(document.getElementById("hint"));
    LetterState.prototype.onRightLetter.call(this);
  };

  LetterErrorState.prototype.onWrongLetter = function () {
    hint.style.color = "gray";
  };

  function onKey(e) {
    var letter = e.key || String.fromCharCode(e.keyCode);
    if (!(letter in ignored)){
      ignored[letter] = true;
      onLetter(letter);
    }
  }
  function onLetter(letter) {
      current.onLetter(letter);
  }

  window.addEventListener("keypress", onKey, false);

  function onKeyUp(e) {
    var letter = e.key || String.fromCharCode(e.keyCode);
    if (letter in ignored){
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
        key.onclick = function (e) {
          onLetter(letter);
        };
      }
      );
  }
  setOnKeyClick();

  document.getElementById("swap").onclick = function () {
    var i = Math.floor(Math.random() * 25),
      key = document.getElementById("keys").children.item(i);
    key.parentNode.insertBefore(key.nextSibling, key);
  };

  document.getElementById("ordered").onclick = function () {
    document.getElementById("keys").innerHTML =
      _.map(_.range(26),
            function (i) {
          return '<button class="key">' + String.fromCharCode(i + 65) + "</button>";
        }
           ).join("");
    setOnKeyClick();
  };
  document.getElementById("ordered").onclick();

  document.getElementById("shuffle").onclick = function () {
    for (i = 0; i < 40; i = i + 1) {
      document.getElementById("swap").onclick();
    }
  };

//  document.getElementById("shuffle").onclick = function () {
//    for (i = 0; i < 26; i = i + 1) {
//      var keys = document.getElementById("keys");
//      keys.insertBefore(keys.children.item(i), _.sample(keys.children));
//    }
//  };

}());
