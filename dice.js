function Dice(){
  this.face = Math.floor((Math.random()*6)+1);;
}

Dice.prototype.getFace = function(){
  return this.face;
}

Dice.prototype.roll = function(){
  this.face = Math.floor((Math.random()*6)+1);;
}

module.exports = exports = Dice;