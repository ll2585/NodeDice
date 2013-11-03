function Card(suit, number){
  this.suit = suit;
  this.number = number;
}

Card.prototype.getSuit = function(){
  return this.suit;
}

Card.prototype.getNumber = function(){
  switch (this.number) {
    case 0:
      return "K";
    break;
    case 1:
      return "A";
    break;
    case 11:
      return "J";
    break;
    case 12:
      return "Q";
    break;
    default:
      return this.number;
  }
}

Card.prototype.getDescription = function(){
  return this.getNumber() + this.getSuit();
}

function Deck() {
  return this._makeDeck();
}

Deck.prototype._makeDeck = function() {
  var pack = new Array();
  var suits = new Array("H", "C", "S", "D");
  var lastNumber = 13;
  suits.forEach(function(s){
    var i;
    for (i = 0; i < lastNumber; i++) {
      var c = new Card(s, i);
      pack.push(c);
    }
  });
return pack;
}

module.exports = exports = Deck;