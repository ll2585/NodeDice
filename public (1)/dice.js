    function updateScoreboard(scores){
        console.log('updating scoreboard with scores');
        console.log(scores);
        var scoresHTML = '';
        for(var i=0, len=scores.length; i < len; i++){
            scoresHTML += '<tr id = "tr_' +scores[i].id+'"><td>' + scores[i].name+ '</td><td>'+ scores[i].score +'</td></tr>';
        }
        //toappend.hide();
        $(".players").html(scoresHTML);
    }