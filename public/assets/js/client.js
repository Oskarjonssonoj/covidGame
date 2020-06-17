const socket = io();

// QUERY SELECTOR VARIABLES
const startPage = document.querySelector('#startPage');
const playerNickname = document.querySelector('#playerNickname-form');
const lobbyRoom = document.querySelector('#waitForConnect');
const playingField = document.querySelector('#playingField');
const gameBoard = document.querySelector('#gameBoard');
const gameBoardInfo = document.querySelector('#players')
const virus = document.getElementById('virus');
const timer = document.querySelector('#countdown')
const restartButton = document.querySelector('#restartButton')
const gameOverDiv = document.querySelector('#gameOver')
const gameOverText = document.querySelector('#gameOverText')

// GENERAL VARIABLES
let nickname = null;
let playersLob = []
let playerScoreOne = {
    score: 0,
    reactions: []
}
let playerScoreTwo = {
    score: 0,
    reactions: []
}
let startTime;
let endTime;
let reactionTime;
let score = 1;


// GENERAL FUNCTIONS
const gameOver = () => {
    gameBoard.classList.add('hide');
    gameBoardInfo.classList.add('hide');
    document.querySelector("#countdown").classList.add('hide');

    let playerThatWon;

    const bestReactionTimeOne = Math.min(...playerScoreOne.reactions)
    const bestReactionTimeTwo = Math.min(...playerScoreTwo.reactions)

    const winnerTemplate = (playerThatWon) => {
        gameOverText.innerHTML = `
            <div id="resultMatch">
                <h2>The winner is: </h2>
                    <p>${playerThatWon}</p>
                    <br>
                    <br>
                    <p>${playersLob[0]} points: ${playerScoreOne.score}</p>
                    <p>Your best reactiontime was: ${bestReactionTimeOne}</p>
                    <br>
                    <br>
                    <p>${playersLob[1]} points: ${playerScoreTwo.score}</p>
                    <p>Your best reactiontime was: ${bestReactionTimeTwo}</p>
                    
            </div>`
    }

    const drawTemplate = () => {
        gameOverText.innerHTML = `
        <div id="resultMatch">
            <h2>It's a draw</h2>
                <p>${playersLob[0]} points: ${playerScoreOne.score} and ${playersLob[1]} points: ${playerScoreTwo.score}</p>
                
        </div>`
    }

    if(playerScoreOne.score > playerScoreTwo.score) {
        playerThatWon = playersLob[0];
        winnerTemplate(playerThatWon);
        gameOverDiv.classList.remove('hide');
    } else if (playerScoreOne.score < playerScoreTwo.score) {
        playerThatWon = playersLob[1];
        winnerTemplate(playerThatWon);
        gameOverDiv.classList.remove('hide');
    } else {
       drawTemplate();
       gameOverDiv.classList.remove('hide');
    }
}

const lobby = () => {
    lobbyRoom.classList.add('hide');
    playingField.classList.remove('hide');
    document.querySelector("#playerOneName").innerText = playersLob[0];
    document.querySelector("#playerTwoName").innerText = playersLob[1];

    connectedPlayersReady();
}

const updatePlayersOnline = (players) => {
    console.log(players)
    playersLob = players;
    console.log('playersLob', playersLob)
	document.querySelector('#players-online').innerHTML = players.map(player => `<li class="player"><span class="fas fa-user"></span>${player}</li>`).join("");
}

const scoreBoard = (gameData) => {
    if (gameData.nickname === playersLob[0]) {
        playerScoreOne.score ++;
        playerScoreOne.reactions.push(gameData.reaction)

        const playerOneInfo = document.querySelector('#playerOneInfo');
        playerOneInfo.innerHTML = 
        `<div>
            <p>Score: ${gameData.score}</p>
            <p>Reactiontime: ${gameData.reaction}</p>
        </div>`
    } else if (gameData.nickname === playersLob[1]){
        playerScoreTwo.score ++;
        playerScoreTwo.reactions.push(gameData.reaction)

        const playerTwoInfo = document.querySelector('#playerTwoInfo');
        playerTwoInfo.innerHTML = 
        `
            <p>Score: ${gameData.score}</p>
            <p>Reactiontime: ${gameData.reaction}</p>
        `
    }
}

const connectedPlayersReady = () => {
    let timeleft = 3;
    const tickingTimer = setInterval(function(){
      if(timeleft <= 0){
        clearInterval(tickingTimer);
        startTime = Date.now();
        virus.classList.remove('hide');
        document.getElementById("countdown").classList.add('hide');
      } else {
        document.getElementById("countdown").innerHTML = ` ${timeleft}`;
      }
      timeleft -= 1;
    }, 1500);
}

const randomVirusPosition = (target, randomDelay) => {
    virus.classList.add('hide')
    setTimeout(() => {
        virus.style.top = target.width + "px";
        virus.style.left = target.height + "px";
        virus.classList.remove('hide')
        startTime = Date.now();
    }, randomDelay)
}

const clickedVirus = (e) => {
    if(e.target.tagName === 'IMG') {
        //stop the timer
        endTime = Date.now()
        //reaction time
        reactionTime = (endTime - startTime)/1000;
    }
}

/* Start new round */
const startRound = (clickVirusPosition, randomDelay) => {
    randomVirusPosition(clickVirusPosition, randomDelay);
}


// EVENT FUNCTIONS
virus.addEventListener('click', e => {
    clickedVirus(e);
   
    const data = {
        name: nickname,
        reaction: reactionTime,
        score: score++
    }

	socket.emit('player-click', data)
})


playerNickname.addEventListener('submit', e => {
	e.preventDefault();

	nickname = document.querySelector('#nickname').value;
	socket.emit('register-player', nickname, (status) => {

        if (status.joinGame) {
			startPage.classList.add('hide');
			lobbyRoom.classList.remove('hide');

            updatePlayersOnline(status.onlinePlayers);
            document.querySelector("#connectedPlayer").innerHTML = `
            <h2>Connected Player:</h2>
            <p>${nickname}</p>`
		}
	});

});

restartButton.addEventListener('click', e => {
    console.log("Clicked")
})


// SOCKET FUNCTIONS
socket.on('reconnect', () => {
	if (nickname) {
		socket.emit('register-player', nickname, () => {
		});
	}
});

socket.on('players-online', (players) => {
    updatePlayersOnline(players);
    document.querySelector("#playerOneName").innerText = players[0];
    document.querySelector("#playerTwoName").innerText = players[1];
});


// socket.on('player-click', (target, gameData) => {
// });

socket.on('new-round', (clickVirusPosition, gameData, randomDelay) => {
    scoreBoard(gameData)
    startRound(clickVirusPosition, randomDelay)
});

socket.on('game-over', (gameData) => {
    scoreBoard(gameData);
    gameOver(gameData);
})

socket.on('create-game-page', lobby);
