function Player(playerID) {
	this.id = playerID;
	this.name = "";
	this.tableID = "";
	this.hand = [];
	this.score = 0;
	this.ready = false;
	this.readyStatus = "Not Ready";
};

Player.prototype.setName = function(name) {
  this.name = name;
}

Player.prototype.getName = function() {
  return this.name;
}

Player.prototype.setReady = function() {
  this.ready = true;
  this.readyStatus = "Ready";
}

Player.prototype.resetPlayer = function() {
  this.ready = false;
  this.readyStatus = "Not Ready";
  this.score = 0;
}

Player.prototype.getScore = function() {
  return this.score;
}

Player.prototype.setScore = function(score) {
  this.score = score;
}

Player.prototype.getID = function() {
  return this.id;
}

Player.prototype.getReadyStatus = function() {
	console.log("AM I READY? " + this.readyStatus);
  return this.readyStatus;
}

Player.prototype.isReady = function() {
  return this.ready;
}

module.exports = exports = Player;