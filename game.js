var Deck = require("./deck");

function Game() {
  var d = new Deck;
  this.pack = this._shufflePack(d);
}


Game.prototype._shufflePack = function(pack) {
  var i = pack.length, j, tempi, tempj;
  if (i === 0) return false;
  while (--i) {
    j = Math.floor(Math.random() * (i + 1));
    tempi = pack[i];
    tempj = pack[j];
    pack[i] = tempj;
    pack[j] = tempi;
  }
  return pack;
}

Game.prototype.drawCard = function(pack, amount, hand, initial) {
  var cards = new Array();
  cards = pack.slice(0, amount);

  pack.splice(0, amount);

  if (!initial) {
    hand.push.apply(hand, cards);
//hand.concat(hand);
}

return cards;
}

Game.prototype.playCard = function(amount, hand, index) {
  hand.splice(index, amount)
  return hand;
}


Game.prototype.playFirstCardToTable = function(pack) {
  return pack.shift();
}

Game.prototype.isCardPlayable = function(card, lastCardOnTable) {
  cardArray = card.split(/([1-9]|1[0-3])([H|S|C|D])/);
  cardArray = cardArray.filter(function(n){return n});
  lastCardArray = lastCardOnTable.split(/([1-9]|1[0-3])([H|S|C|D])/);
  lastCardArray = lastCardArray.filter(function(n){return n});

  cardNumber = cardArray[0]; cardSuite = cardArray[1];
  lastCardNumber = lastCardArray[0]; lastCardSuite = lastCardArray[1];
  if (cardNumber == lastCardNumber || cardSuite == lastCardSuite)
    return true;
  else return false;
}

//getting the last card from the table:
if(!Array.prototype._last) {
  Array.prototype._last = function() {
    return this[this.length - 1];
  }
}
Game.prototype.lastCardOnTable = function(table) {
  return table._last();
}

Game.prototype.gameState = function() {
  return {};
}

module.exports = exports = Game;