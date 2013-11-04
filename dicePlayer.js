var Dice = require("./dice");

function DicePlayer(player) {
	this.person = player;
	this.dice = [new Dice(), new Dice()];
	this.canReroll = [true, true];
	this.turnScore = 0;
	this.gameScore = 0;
};

DicePlayer.prototype.roll = function() {
  for(var i = 0; i < this.dice.length; i++){
  	this.dice[i].roll();
  }
  this.updateTurnScore();
};

DicePlayer.prototype.getRoll = function() {
	var results = [];
  for(var i = 0; i < this.dice.length; i++){
  	results.push(this.dice[i].getFace());
  }
  return results;
};

DicePlayer.prototype.getRerollStatus = function() {
	return this.canReroll;
};

DicePlayer.prototype.reroll = function(i) {
	if(this.canReroll[i]){
		this.dice[i].roll();
		this.canReroll[i] = false;
		this.updateTurnScore();
	}
};

DicePlayer.prototype.rerollFirstDice = function() {
	this.reroll(0);
};

DicePlayer.prototype.rerollSecondDice = function() {
	this.reroll(1);
};

DicePlayer.prototype.updateScore = function() {
	this.person.setScore(this.gameScore);
};

DicePlayer.prototype.updateTurnScore = function() {
		var rollResult = 0;
	for(var i = 0; i < this.dice.length; i++){
  	rollResult += this.dice[i].getFace();
  }
  this.turnScore = rollResult;
  this.person.setScore(this.gameScore + this.turnScore);
};

DicePlayer.prototype.endTurn = function() {
	this.gameScore = this.gameScore + this.turnScore;
	this.updateScore();
	this.canReroll = [true, true];
	this.turnScore = 0;
};

DicePlayer.prototype.getPerson = function() {
	return this.person;
};


DicePlayer.prototype.getScore = function() {
	return this.person.getScore();
};



module.exports = exports = DicePlayer;