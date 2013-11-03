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

var socket = io.connect('http://localhost:3700');

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
        $("#ready").attr("disabled", "disabled");



        var messages = [];
        var field = $("#field");
        var sendButton = $("#send");
        var content = document.getElementById("content");
        var gameLog = document.getElementById("chatlog");
        var name = $("#name").text();

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
            if(!data.state.gameStarted) {
                var readyStatus = data.state.readyStatus;
                console.log(data.state);
                var everyoneReady = true;
                var playerID = $(".playerID").attr("id");
                for(var i = 0; i <readyStatus.length; i++){
                    if(readyStatus[i].id ==playerID){
                        if(readyStatus[i].score == 'Ready'){
                            console.log("i was ready");
                        } else{
                            $("#ready").removeAttr("disabled")
                        }
                    }
                }
            } else {
                console.log('game did start');
            }
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
            var playerID = $(".playerID").attr("id");
            console.log(playerID + ' called');
            socket.emit("playerReady", {'room': roomID, 'readyPlayer': playerID});
            ready = true;
            $("#deal").removeAttr("disabled");
            $("#ready").attr("disabled", "disabled");
            $("#welcome").show();
            $("#welcome").text("Welcome, " + playerID)
            console.log("Ready:" + ready);


        });

        $("#start").click(function() {
            var playerID = $(".playerID").attr("id");
                console.log("started");
                socket.emit("startGame", {'room': roomID, 'startPlayer': playerID});
                socket.emit("getOpponents");
        });

        socket.on("gameStarted", function(){
            $("#start").attr("disabled", "disabled");
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
    });