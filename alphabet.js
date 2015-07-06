"use strict";

var LetterState = function(letter, audioId){
  this.letter = letter;
  this.audioId = audioId;
}

var LetterErrorState = function(letter, audioId, next){
  this.letter = letter;
  this.audioId = audioId;
  this.next = next;
}

var letterStates = [];

for(var i=0; i<26; i++){
  var letter =  String.fromCharCode(97 + i);
  letterStates[i] = new LetterState(letter, "audio_" + letter);
}

for(var i=1; i<letterStates.length; i++){
  letterStates[i-1].next = letterStates[i];
}
letterStates[letterStates.length-1].next = letterStates[0];

var current = letterStates[0];
var letterLine = document.getElementById("letters");
var hint;

var fixLetterLine = function(){
  while(letterLine.scrollWidth > letterLine.offsetWidth){
    letterLine.innerHTML = letterLine.innerHTML.substring(1);
  }
}
LetterState.prototype.onRightKeyPress = function(){
  document.getElementById(this.audioId).play();
  // assert this === current;
  current = this.next;
  letterLine.innerHTML = letterLine.innerHTML +
    this.letter.toUpperCase() + " ";
  console.log(letterLine.scrollWidth);
  console.log(letterLine.offsetWidth);
  fixLetterLine();
};

LetterState.prototype.onWrongKeyPress = function(){
  hint = document.createElement("span");
  hint.id = "hint";
  hint.style = "color:LightGray";
  var hintText = document.createTextNode(this.letter.toUpperCase());
  hint.appendChild(hintText);
  letterLine.appendChild(hint);
  fixLetterLine();
  current = new LetterErrorState(this.letter, this.audioId, this.next);
}

LetterState.prototype.onKeyPress = function(e){
  if(this.letter ==  e.key){
    this.onRightKeyPress();
  }else{
    this.onWrongKeyPress();
  }
};

LetterErrorState.prototype = Object.create(LetterState.prototype);

LetterErrorState.prototype.onRightKeyPress = function(){
  letterLine.removeChild(document.getElementById("hint"));
  LetterState.prototype.onRightKeyPress.call(this);
}

LetterErrorState.prototype.onWrongKeyPress = function(){
  hint.style = "color:gray";
}

var doKeyDown = function(e){
  current.onKeyPress(e);
};

window.addEventListener( "keypress", doKeyDown, false );
document.getElementById("restart").onclick = function(){
  letterLine.innerHTML = "&nbsp;";
  current = letterStates[0];
}
