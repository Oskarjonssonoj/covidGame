const socket = io();

// QUERY SELECTOR VARIABLES
const startPage = document.querySelector('#startPage');
const playerNickname = document.querySelector('#playerNickname-form');
const lobbyRoom = document.querySelector('#waitForConnect');
const playingField = document.querySelector('#playingField');
const gameBoard = document.querySelector('#gameBoard');
const virus = document.getElementById('virus');
const timer = document.querySelector('#countdown')

// GENERAL VARIABLES
let nickname = null;
let playersLob = []
let playerScoreOne = {
    score: 0,
}
let playerScoreTwo = {
    score: 0,
}
let startTime;
let endTime;
let reactionTime;
let score = 1;


// GENERAL FUNCTIONS
const gameOver = () => {
    gameBoard.classList.add('hide');
    document.querySelector("#countdown").classList.add('hide')
    playingField.innerHTML = `
    <div>
        <h2>Game Over</h2>
        <h3>Result:</h3>
        <p>${playersLob[0]}: ${playerScoreOne.score}</p>
        <p>${playersLob[1]}: ${playerScoreTwo.score}</p>
        <button type="click" class="btn" id="restartButton">Restart Game</button>
    </div>
    `
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
        console.log("playerScoreOne", playerScoreOne)

        const playerOneInfo = document.querySelector('#playerOneInfo');
        playerOneInfo.innerHTML = 
        `<div>
            <p>Score: ${gameData.score}</p>
            <p>Reactiontime: ${gameData.reaction}</p>
        </div>`
    } else if (gameData.nickname === playersLob[1]){
        playerScoreTwo.score ++;
        console.log("playerScoreTwo", playerScoreTwo)
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
        randomVirusPosition()
        virus.classList.remove('hide');
        document.getElementById("countdown").classList.add('hide');
      } else {
        document.getElementById("countdown").innerHTML = ` ${timeleft}`;
      }
      timeleft -= 1;
    }, 1500);
    }

const randomVirusPosition = (target) => {
    virus.classList.add('hide')
    setTimeout(() => {
        virus.style.top = target.width + "px";
        virus.style.left = target.height + "px";
        virus.classList.remove('hide')
        startTime = Date.now();
    }, 1000)
}

const clickedVirus = (e) => {
    if(e.target.tagName === 'IMG' ){
        //stop the timer
        endTime = Date.now()
        //reaction time
        reactionTime = (endTime - startTime)/1000;
    }
}

/* Start new round */
const startRound = (clickVirusPosition) => {
    randomVirusPosition(clickVirusPosition);
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
		}
	});

});


// SOCKET FUNCTIONS
socket.on('reconnect', () => {
	if (nickname) {
		socket.emit('register-player', nickname, () => {
		});
	}
});

socket.on('players-online', (players) => {
	updatePlayersOnline(players);
});


// socket.on('player-click', (target, gameData) => {
// });

socket.on('new-round', (clickVirusPosition, gameData) => {
    scoreBoard(gameData)
    startRound(clickVirusPosition)
});

socket.on('game-over', () => {
    gameOver()
})

socket.on('create-game-page', lobby);
