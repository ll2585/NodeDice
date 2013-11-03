var Game = require("./game");
var DiceGame = require("./dicegame");
var Room = require("./room");
var Table = require("./table");
var Player = require("./player");

Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};


var room = new Room("Test Room");
var table = new Table(1);

var diceRoom = new Room("Room for Dice!", "dice");
var cardRoom = new Room("Room for Cards!", "cards");

var curRoom;
var curTable;
var tableRoomDict = {};
var connectedPlayersDict = {};

function alertConsoleLog(message, alert){
  String.prototype.repeat = function( num )
  {
    return new Array( num + 1 ).join( this );
  }
  console.log(alert.repeat(50));
  console.log(message);
  console.log(alert.repeat(50));
}

function setCurRoomAndCurTable(gameType, id){
  var gameRooms = {
    'dice': diceRoom,
    'cards': cardRoom
  }

  curRoom = gameRooms[gameType];
  console.log(curRoom);
  if(!curRoom.hasTable(id)){
    var table = new Table(id);
    curRoom.addTable(table);
    curTable = table;
  } 
  curTable = curRoom.getTable(id);

  alertConsoleLog("curTable set to " + curTable, "!");
}




var express = require("express");
var MongoStore = require('connect-mongo')(express);
var sessionStore = new MongoStore({
  url: 'mongodb://localhost/test'
});
var cookieParser = express.cookieParser('your secret sauce');

var app = express();
var http = require('http');
var EXPRESS_SID_KEY = 'express.sid';
var port = process.env.PORT || 3700;
var players = {};
var start = false;

app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
var COOKIE_SECRET = 'very secret string';

app.configure(function () {

  app.use(cookieParser);

  app.use(express.session({
    store: sessionStore,
    cookie: { 
      httpOnly: true
    },
    key: EXPRESS_SID_KEY
  }));

  app.use(express.static(__dirname + '/public'));

  app.use(express.bodyParser());
  
});

var io = require('socket.io').listen(app.listen(port));

app.get("/login", function(req, res){
  res.render("login");
});

app.post('/red', function(req, res){
  req.session.name = req.body.name;
  req.session.isLogged = true;
  res.redirect("/");
});

app.get("/", function(req, res){
  if (!req.session.name) {
    res.redirect("/login");
  }else{
    console.log("?F");
    req.session.isLogged = true;
    var query = require('url').parse(req.url,true).query;
    var id=query.id;
    var gameType = query.game;
    if (id == null || gameType == null) {
      console.log("OK");
      res.redirect("/?game=dice&id=685464654");
    }else{
    setCurRoomAndCurTable(gameType, id);
    res.render("page", {player: {name: req.session.name, id: req.session.id }, id: id, game: gameType });
    }
  }
});


io.set('authorization', function (data, callback) {
  if(!data.headers.cookie) {
    return callback('No cookie transmitted.', false);
  }

    // We use the Express cookieParser created before to parse the cookie
    // Express cookieParser(req, res, next) is used initialy to parse data in "req.headers.cookie".
    // Here our cookies are stored in "data.headers.cookie", so we just pass "data" to the first argument of function
    cookieParser(data, {}, function(parseErr) {
      if(parseErr) { return callback('Error parsing cookies.', false); }

        // Get the SID cookie
        var sidCookie = (data.secureCookies && data.secureCookies[EXPRESS_SID_KEY]) ||
        (data.signedCookies && data.signedCookies[EXPRESS_SID_KEY]) ||
        (data.cookies && data.cookies[EXPRESS_SID_KEY]);

        // Then we just need to load the session from the Express Session Store
        sessionStore.load(sidCookie, function(err, session) {
                // And last, we check if the used has a valid session and if he is logged in
                if (err || !session || session.isLogged !== true) {
                  callback('Error', false);
                } else {
                    // If you want, you can attach the session to the handshake data, so you can use it again later
                    data.session = session;

                    callback(null, true);
                  }
                });
      });
  });


function countClientsInRoom(room){
 // 'io.sockets.manager.rooms' is an object that holds
 // the active room names as a key and an array of
 // all subscribed client socket ids
 if(io.sockets.manager.rooms['/' + room]){
  return io.sockets.manager.rooms['/' + room].length;
}
return 0;
}

function unsubscribe(socket, data){
 // update all other clients about the offline
 // presence

 // remove the client from socket.io room
 socket.leave(data.room);
}


function disconnect(socket,session){
 // get a list of rooms for the client
 var rooms = io.sockets.manager.roomClients[socket.id];
 var player = players[session.id];
 // unsubscribe from the rooms
 for(var room in rooms){
  console.log(room);
  if(room && rooms[room]){
    var roomNumber = room.replace('/','');
    var tableLeft = tableRoomDict[roomNumber];
    unsubscribe(socket, { room: roomNumber });
    socket.broadcast.to(roomNumber).emit('message', { message: session.name + ' has left.' });
    tableLeft.removeFromTable(session.id);
    io.sockets.in(room.replace('/','')).emit('refreshScoreboard', { table: tableLeft });
  }
}

}


function disconnectFromRoom(socket,session,room){
 // get a list of rooms for the client
 console.log("leaving room " + room);
 console.log(room);
 //var rooms = io.sockets.manager.roomClients[socket.id];
 var player = players[session.id];
 // unsubscribe from the rooms
 console.log(tableRoomDict);
  var tableLeft = tableRoomDict[room];
  console.log("ROOM");
  console.log(room);
  unsubscribe(socket, { room: room });
  socket.broadcast.to(room).emit('message', { message: session.name + ' has left.' });
  tableLeft.removeFromTable(session.id);

  var curScores = tableLeft.getGameScores();
  io.sockets.in(room).emit('refreshScoreboard', { scores: curScores });
}

function setUpServerVariables(room, playerID){
	if(connectedPlayersDict[room] == null) connectedPlayersDict[room] = {};
    connectedPlayersDict[room][playerID] = true;
    tableRoomDict[room] = curTable;
}

function setUpTable(session){
	var playerID = session.id;
	var playerName = session.name;
    if(!curTable.hasPlayer(playerID)){
      var player = new Player(playerID);
      player.setName(playerName);
      curTable.addPlayer(player);
      console.log("Player " + player + " joined table " + curTable + "!");
      //socket.emit('joinedTable', { table: curTable });
       //socket.broadcast.to(room).emit('joinedTable', { table: curTable });
    }
}

io.on('connection', function (socket) {
  var hs = socket.handshake;
  var session = hs.session;
  var playerID = session.id;
  var playerName = session.name;
  var roomJoined = null;
  var room = null;

  function setUpSocketVariables(room){
    roomJoined = room;
    room = room;
  }

  function emitScoreboardUpdate(){
    var curScores = curTable.getGameScores();
    io.sockets.in(room).emit('refreshScoreboard', { scores: curScores });
  }

  function checkForEveryoneReady(){
    if(!curTable.playerReady(playerID)){
      io.sockets.in(room).emit('iAmNotReady');
    }
    if(curTable.everyoneReady()){
      socket.in(room).emit('everyoneReady');
    }
  }

	function emitGameState(){
     if(curTable.gameStarted()){
        var curGameState = curTable.getGameState();
      	io.sockets.in(room).emit('curGameState', { state: curGameState });
    }
  }

  function playerAlreadyAtTable(session){
  	return curTable.hasPlayer(playerID);
  }

  socket.on('subscribe', function(room) {
  	setUpServerVariables(room, playerID);
  	setUpSocketVariables(room, playerID);
    socket.join(room); 

    if(!playerAlreadyAtTable(session)){
    setUpTable(session);
	socket.broadcast.to(room).emit('message', { message: playerName + ' has joined.' });
	}

    alertConsoleLog(io.sockets.clients(room), "$");
    
    checkForEveryoneReady();
    emitScoreboardUpdate();
    emitGameState();
  });

  socket.on('unsubscribe', function(room) {  
    console.log('leaving room', room);
    socket.leave(room); 
  });

  socket.on('send', function(data) {
    io.sockets.in(data.room).emit('message', data);
  });

  console.log('A socket with sessionID '+session.id+' connected.');


  socket.emit('message', { message: 'welcome to the chat ' + session.name });
  socket.emit('loadGameLog', curTable.getMessages());


function sendGameMessage(newMessage){
	var newMessages = []
    newMessages.push(newMessage);
    curTable.addMessages(newMessages);
    io.sockets.in(room).emit('gameLogMessage', newMessages);
}

function sendAllGameMessages(){
    var gameMessages = curTable.getGame().getGameMessages();
    curTable.addMessages(gameMessages);
    io.sockets.in(room).emit('gameLogMessage', gameMessages);
}
  socket.on('playerReady', function(data){
    var player = curTable.getPlayer(playerID);

    player.setReady();

    var readyMessage = "Player " + player.getName() + " with id: " + player.getID() + " is ready.";
    sendGameMessage(readyMessage);

    emitScoreboardUpdate();

    if(curTable.everyoneReady()){
          io.sockets.in(room).emit('everyoneReady');
     // socket.in(room).emit('everyoneReady');
    }
 });

  socket.on('addPlayer', function(player){
    console.log("this used to do something, now it doesnt lol.");
    return;
    players[session.id] = player;
    console.log("Player " + player + " with id: " + session.id + "is ready.");
    io.sockets.emit('gameLogMessage', { message: "Player " + player + " with id: " + session.id + "is ready."});
    for(var key in players) {
     console.log("Players: " + key + ": " + players[key]);
   }
 });

  socket.on('disconnect', function(){
        alertConsoleLog(connectedPlayersDict, "#");
        alertConsoleLog(roomJoined, "#");
        alertConsoleLog(connectedPlayersDict[roomJoined], "#");
    var reConnectTime = 1*5*1000;
    delete(connectedPlayersDict[roomJoined][playerID]);
    var roomLeft = roomJoined;
     setTimeout(function(){
      console.log("the room is " + roomLeft);
      if(connectedPlayersDict[roomJoined][playerID] == null){
          disconnectFromRoom(socket, session, roomLeft);
    console.log("Player with id: " + session.id + "has disconnected from room " + roomLeft);
    var player = players[session.id];
    curTable.removeFromTable(session.id);
    delete players[session.id];
    for(var key in players) {
      console.log("Remaining players: " + key + ": " + players[key]);
    }
  }
}, reConnectTime);

    //reset pack
  });

  socket.on('dealCards', function(){
    console.log("Here you go!");
    var cards = game.drawCard(table.pack, 5, "", true);
    var cardNames = "";
    cards.forEach(function(card){
      cardNames += card.getDescription() + " ";
    });
    socket.emit('showCards', cardNames);
    console.log(cards);
    io.sockets.emit("remainingCards", table.pack.length)
  });

    socket.on('startGame', function(data){

    console.log("game started!");
    var player = curTable.getPlayer(playerID);
    var gameStartedMessage = "Player " + player.getName() + " with id: " + playerID + " has started the game!";
    sendGameMessage(gameStartedMessage);

    //socket.emit('showCards', cardNames);
    console.log(curRoom);
    if(curRoom.getGameType() == "dice"){
    var game = new DiceGame();
    var DicePlayer = require("./dicePlayer");
    for(var p in curTable.getPlayers()){
      game.addPlayer(new DicePlayer(curTable.getPlayers()[p]));
      }
     }
    curTable.newGame(game);

    emitGameState();


    io.sockets.in(room).emit('playerRolled', curTable.getGame().getCurPlayer().getRoll());
    io.sockets.in(room).emit("gameStarted");
        checkForMyTurn();

    sendAllGameMessages();
    emitScoreboardUpdate();


  });

socket.on('checkMyTurn', function(){
        checkForMyTurn();
  });

function IAmCurPlayer(){
	var curPlayer = curTable.getGame().getCurPlayer();
	return playerID == curPlayer.getPerson().getID();
}

socket.on('reroll1', function(){
    if(IAmCurPlayer()){
      curTable.getGame().rerollFirstDice();
    }

    emitGameState();


    io.sockets.in(room).emit('playerRolled', curTable.getGame().getCurPlayer().getRoll());
    io.sockets.in(room).emit("gameStarted");

    sendAllGameMessages();
    emitScoreboardUpdate();

  });

socket.on('reroll2', function(){
  if(IAmCurPlayer()){
      curTable.getGame().rerollSecondDice();
    }

    emitGameState();

    io.sockets.in(room).emit('playerRolled', curTable.getGame().getCurPlayer().getRoll());
    io.sockets.in(room).emit("gameStarted");

    sendAllGameMessages();
    emitScoreboardUpdate();
  });

function checkForMyTurn(){
	if(IAmCurPlayer()){
    	var curPlayer = curTable.getGame().getCurPlayer();
      console.log("I am the current player");
      var reRollStatus = curPlayer.getRerollStatus();
      var roll = curPlayer.getRoll();
      socket.in(room).emit('myTurn', {'rerolls': reRollStatus, 'roll': roll});
    }else{
      socket.in(room).emit('notmyTurn');
    }
}

socket.on('endTurn', function(){
  if(IAmCurPlayer()){
      curTable.getGame().endTurn();
    }
    emitGameState();
    sendAllGameMessages();
    emitScoreboardUpdate();

    if(!curTable.getGame().gameOver()){
      io.sockets.in(room).emit('playerEndedTurn');
      handleNewRound();
    }else{
      curTable.getGame().endGame();
      handleGameOver();
    }

  });

function handleNewRound(){
  curTable.getGame().newRound();
    io.sockets.in(room).emit('playerRolled', curTable.getGame().getCurPlayer().getRoll());
    checkForMyTurn();

    sendAllGameMessages();
    emitScoreboardUpdate();
}

function handleGameOver(){
        alertConsoleLog("GAMEOVER", "?");
        var winner = curTable.getGame().getWinner();
    io.sockets.in(room).emit('gameOver', curTable.getGame().getWinner());
    //checkForMyTurn();

    sendAllGameMessages();
    emitScoreboardUpdate();
    curTable.resetGame();
}

});
console.log("Listening on port " + port);