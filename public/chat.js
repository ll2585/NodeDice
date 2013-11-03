    // Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

var socket = io.connect(window.location.hostname);

    function sendChatMessageOnEnter(myMessage, sendButton){
        myMessage.keyup(function(event){
            if(event.keyCode == 13){
                sendButton.click();

            }
        });
    }

    function makeChatWindowScrollToNewMessages(chatWindow){
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    $(document).ready(function(){
        var roomID = getUrlVars()["game"]+getUrlVars()["id"];
        socket.emit('subscribe', roomID);

        $("#start").attr("disabled", "disabled");
        $("#rr1").hide();
        $("#rr2").hide();
        $("#end").hide();

        $("#ready").attr("disabled", "disabled");



        var messages = [];
        var field = $("#field");
        var sendButton = $("#send");
        var content = document.getElementById("content");
        var gameLog = document.getElementById("chatlog");
        var name = $("#name").text();
        var playerID = $(".playerID").attr("id");

        sendChatMessageOnEnter(field, sendButton);

        socket.on('refreshScoreboard', function (data) {
            console.log("the scores are ");
            console.log(data.scores);
            var scores = data.scores;
            updateScoreboard(scores);
        });

        socket.on('message', function (data) {
            if(data.message) {
                messages.push(data);
                var html = '';
                for(var i=0; i<messages.length; i++) {
                    html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                    html += messages[i].message + '<br />';
                }
                content.innerHTML = html;
                makeChatWindowScrollToNewMessages(content);
            } else {
                console.log("There is a problem:", data);
            }
        });

        socket.on('curGameState', function (data) {
            handleGameState(data);
        });
        
        socket.on('loadGameLog', function (log) {
            var html = '';
            for(var i=0; i<log.length; i++) {
                    html += '<b>' + log[i] + ': </b> <br />';
                    //html += messages[i].message + '<br />';
                }
                $("#chatlog").html(html);
                makeChatWindowScrollToNewMessages(gameLog);
            });


        socket.on('gameLogMessage', function (log){
            var html = '';
            for(var i=0; i<log.length; i++) {
                    html += '<b>' + log[i] + ': </b> <br />';
                    //html += messages[i].message + '<br />';
                }
                $("#chatlog").append(html);
                makeChatWindowScrollToNewMessages(gameLog);
            });

        socket.on('data', function (data) {
                console.log(data);
            });

            socket.on('error', function (reason){
              console.error('Unable to connect Socket.IO', reason);
            });

            socket.on('connect', function (){
              console.info('successfully established a working and authorized connection');
            });

            socket.on('everyoneReady', function (){
              $("#start").removeAttr("disabled");
            });

            socket.on('iAmNotReady', function (){
              $("#ready").removeAttr("disabled");
            });




        sendButton.click(function() {
            if(name.value == "") {
                alert("Please type your name!");
            } else {
                var text = field.val();
                socket.emit('send', { room: roomID, message: text, username: name });
                field.val('');;
            }
        });


        $("#ready").click(function() {
            console.log(playerID + ' called');
            socket.emit("playerReady");
            ready = true;
            $("#deal").removeAttr("disabled");
            $("#ready").attr("disabled", "disabled");
            $("#welcome").show();
            $("#welcome").text("Welcome, " + playerID)
            console.log("Ready:" + ready);


        });

        $("#start").click(function() {
            
                console.log("started");
                socket.emit("startGame");
                socket.emit("getOpponents");
        });

        socket.on("gameStarted", function(){
            $("#start").attr("disabled", "disabled");
            socket.emit("checkMyTurn");
        });

        socket.on("playerEndedTurn", function(){
            socket.emit("checkMyTurn");
        });

        socket.on("gameOver", function(winner){
            console.log("GAMEOVER");
            console.log(winner);
            $("#rr1").hide();
        $("#rr2").hide();
        $("#end").hide();
        $("#ready").removeAttr("disabled");
        });

        socket.on("showCards", function(cards){
            if (ready) {
                $("#cards").text(cards);
                socket.on("displayOpponents", function(opponent){
                    $("#opponents").text("Your opponent is: " + opponent);
                });
            }
        });

        socket.on("remainingCards", function(remaining){
            if (ready) {
                $("#pack").text();
                $("#pack").text("Remaining cards are: " + remaining);
            }
        });

        socket.on("playerRolled", function(diceRolled){
            console.log("PLAYER ROLLED")
            console.log(diceRolled);
            $('#roll1').html('<img id="Dice1" src="/img/dice' + (diceRolled[0]) + '.png" />')
            $('#roll2').html('<img id="Dice1" src="/img/dice' + (diceRolled[1]) + '.png" />')
        });

        socket.on("myTurn", function(data){
            var rerollStatus = data.rerolls;
            var roll = data.roll;
            $("#rr1").show();
            $("#rr2").show();
            $("#end").show();
            $("#rr1").prop('value', "Reroll " + roll[0]);
            $("#rr2").prop('value', "Reroll " + roll[1]);
            if(!rerollStatus[0]){
                 $("#rr1").attr("disabled", "disabled");
            }else{
                $("#rr1").removeAttr("disabled");
            }
            if(!rerollStatus[1]){
                 $("#rr2").attr("disabled", "disabled");
            }else{
                $("#rr2").removeAttr("disabled");
            }
            console.log("MY RUTNR!");
            console.log(rerollStatus);
        });

        $("#rr1").click(function() {
            
                console.log("reroll1");
                socket.emit("reroll1", {'room': roomID, 'myID': playerID});
        });

        $("#rr2").click(function() {
            
                console.log("reroll2");
                socket.emit("reroll2", {'room': roomID, 'myID': playerID});
                socket.emit("getOpponents");
        });

        $("#end").click(function() {
            
                console.log("endedTurn");
                socket.emit("endTurn", {'room': roomID, 'myID': playerID});
                socket.emit("getOpponents");
        });

        socket.on("notmyTurn", function(){
            $("#rr1").hide();
            $("#rr2").hide();
            $("#end").hide();
        });
    });