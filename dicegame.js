function DiceGame() {
  this.curPlayer = null;
  this.players = [];
  this.messages = [];
  this.pointThreshold = 20;
  this.winner = null;
}


DiceGame.prototype.start = function() {
  this.curPlayer = this.players[0];
  this.addMessage("Player " + this.curPlayer.getPerson().getName() + " with id " + this.curPlayer.getPerson().getID() + " is the current player!");


  this.curPlayer.roll();
   this.addMessage("Player " + this.curPlayer.getPerson().getName() + " rolled " +  this.curPlayer.getRoll());
}

DiceGame.prototype.addPlayer = function(player) {
  this.players.push(player);
}

DiceGame.prototype.gameState = function() {
  return {'players': this.players, 'curPlayer': this.curPlayer, 'curPlayerRoll': this.curPlayer.getRoll()};
}

DiceGame.prototype.curPlayerStats = function() {
  return {'players': this.players, 'curPlayer': this.curPlayer};
}

DiceGame.prototype.rerollFirstDice = function() {
	this.messages = [];
	this.addMessage("Player " + this.curPlayer.getPerson().getName() + " rerolls the first dice.");
	var originalDice = this.curPlayer.getRoll()[0];
  this.curPlayer.rerollFirstDice();
  var newDice = this.curPlayer.getRoll()[0];
  this.addMessage("Player " + this.curPlayer.getPerson().getName() + " rerolls the " + originalDice + " into a " + newDice  + ".");
}

DiceGame.prototype.rerollSecondDice = function() {
	this.messages = [];
	this.addMessage("Player " + this.curPlayer.getPerson().getName() + " rerolls the second dice.");
	var originalDice = this.curPlayer.getRoll()[1];
  this.curPlayer.rerollSecondDice();
  var newDice = this.curPlayer.getRoll()[1];
  this.addMessage("Player " + this.curPlayer.getPerson().getName() + " rerolls the " + originalDice + " into a " + newDice  + ".");
}

DiceGame.prototype.getCurPlayer = function() {
  return this.curPlayer;
}

DiceGame.prototype.getScoreArray = function() {
  var gameScores = []
 for(var i = 0 ; i < this.players.length; i++){
    var playerID = this.players[i].getPerson().getID();
    var playerName = this.players[i].getPerson().getName();
    var playerScore = this.players[i].getPerson().getScore();
    gameScores.push({'id': playerID, 'name': playerName, 'score': playerScore});
  }
  return gameScores;
}

DiceGame.prototype.getGameMessages = function() {
  return this.messages;
}

DiceGame.prototype.addMessage = function(msg) {
  return this.messages.push(msg);
}

DiceGame.prototype.gameOver = function() {
  for(var i = 0 ; i < this.players.length; i++){
    var playerScore = this.players[i].getPerson().getScore();
    if (playerScore >= this.pointThreshold) {
      this.winner = this.players[i].getPerson();
      return true;
    }
  }
  return false;
}

DiceGame.prototype.getWinner = function() {
  return this.winner;
}

DiceGame.prototype.endGame = function() {
  this.curPlayer = null;
  this.messages = [];
  this.addMessage("Game is over brahs. Please ready up for new game.");
}

DiceGame.prototype.newRound = function() {
    if(this.curPlayer == this.players[1]){
    this.curPlayer = this.players[0];
  }else{
    this.curPlayer = this.players[1];
  }
  this.addMessage("Player " + this.curPlayer.getPerson().getName() + " with id " + this.curPlayer.getPerson().getID() + " is the current player!");


  this.curPlayer.roll();
  this.addMessage("Player " + this.curPlayer.getPerson().getName() + " rolled " +  this.curPlayer.getRoll());
}


DiceGame.prototype.endTurn = function() {
  this.messages = [];
  this.curPlayer.endTurn();

}

module.exports = exports = DiceGame;