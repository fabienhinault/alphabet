(function () {
  'use strict';

  var letterStates = [],
    letter,
    i,
    current,
    letterLine = document.getElementById("letters"),
    hint;

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
    document.getElementById(this.audioId).play();
    // assert this === current;
    current = this.next;
    letterLine.innerHTML = letterLine.innerHTML + this.letter.toUpperCase() +
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
    current.onLetter(e.key || String.fromCharCode(e.keyCode));
  }
  function onLetter(letter) {
    current.onLetter(letter);
  }

  window.addEventListener("keypress", onKey, false);
  
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
    var i = Math.floor(Math.random() * 26),
      key = document.getElementById("keys").children.item(i);
    key.parentNode.insertBefore(key.nextSibling, key);
  };
  
//  document.getElementById("ordered").onclick = function () {
//    document.getElementById("keys").innerHTML =
//      _.map(_.range(26),
//            function (i) {
//          return '<div class="key">' + String.fromCharCode(i + 65) + "</div>";
//        }
//           ).join("");
//    setOnKeyClick();
//  };
  
//  document.getElementById("shuffle").onclick = function () {
//    for (i = 0; i < 10; i = i + 1) {
//      document.getElementById("swap").onclick();
//    }
//  };
//  
}());