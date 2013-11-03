var Game = require("./game");
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
table.setName("Test Room");
room.tables = table;
var game = new Game();
table.gameObj = game;
table.pack = game.pack;
table.cardOnTable = table.gameObj.playFirstCardToTable(table.pack);

var express = require("express");
var cookie = require('cookie');
var connect = require('connect');
var cookieParser = express.cookieParser('your secret sauce')
, sessionStore = new connect.middleware.session.MemoryStore();
var app = express();
var port = 3700;
var players = {};
var start = false;

app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

app.configure(function () {
    app.use(cookieParser);
    app.use(express.session({ store: sessionStore }));
    app.use(express.static(__dirname + '/public'));
    app.use(express.bodyParser());
});
var io = require('socket.io').listen(app.listen(port));
var SessionSockets = require('session.socket.io');
var sessionSockets = new SessionSockets(io, sessionStore, cookieParser);

app.get("/login", function(req, res){
    res.render("login");
});

app.post('/red', function(req, res){
  req.session.name = req.body.name;
  res.redirect("/");
});

app.get("/", function(req, res){
    if (!req.session.name) {
        res.redirect("/login");
    }else{
        res.render("page", {player: {name: req.session.name } });
    }
});



sessionSockets.on('connection', function (err, socket, session) {

    socket.on('connectToServer',function(data){
        var player = new Player(socket.id);
        player.setName("Tamas");
        room.addPlayer(player);
        table.addPlayer(player);
        console.log("Player joined!");
    });

    socket.emit('message', { message: 'welcome to the chat ' + session.name });

    socket.on('addPlayer', function(player){
     players[socket.id] = player;
     console.log("Player " + player + "with id: " + socket.id + "is ready.");
     io.sockets.emit('message', { message: "Player " + player + "with id: " + socket.id + "is ready."});
     console.log(Object.size(players));
     for(var key in players) {
       console.log("Players: " + key + ": " + players[key]);
   }
});

    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });


    socket.on('disconnect', function(){
        console.log("Player with id: " + socket.id + "has disconnected");
        delete players[socket.id];
        for(var key in players) {
          console.log("Remaining players: " + key + ": " + players[key]);
      }
    //reset pack
});

    socket.on('dealCards', function(){
     var cards = game.draw(pack, 5, "", true);
     socket.emit('showCards', cards);
     io.sockets.emit("remainingCards", pack.length)
 });

});
console.log("Listening on port " + port);
