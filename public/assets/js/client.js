// CLIENT JAVASCRIPT
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


// SOUND EFFECTS
let bleep = new Audio("./assets/sounds/killTwo.mp3");
let tick = new Audio("./assets/sounds/countbeep.mp3");
let start = new Audio("./assets/sounds/startbeep.mp3")
let getReady = new Audio("./assets/sounds/getready.mp3")


// GENERAL FUNCTIONS
const gameOver = () => {
    gameBoard.classList.add('hide');
    gameBoardInfo.classList.add('hide');
    document.querySelector("#countdown").classList.add('hide');

    let playerThatWon;

    const bestReactionTimeOne = Math.min(...playerScoreOne.reactions)
    const bestReactionTimeTwo = Math.min(...playerScoreTwo.reactions)

    const allReactionsOne = () => {
        document.querySelector('#allReactionsOne').innerHTML = playerScoreOne.reactions.map(reaction => `<li class="reaction">${reaction} seconds</li>`).join("");
    }

    const allReactionsTwo = () => {
        document.querySelector('#allReactionsTwo').innerHTML = playerScoreTwo.reactions.map(reaction => `<li class="reaction">${reaction} seconds</li>`).join("");
    }

    const winnerTemplate = (playerThatWon) => {
        gameOverText.innerHTML = `
            <div id="resultMatch">
                <h1>The winner is: </h1>
                <h2 id="winnerName">${playerThatWon}</h2>
                    <div id="sumMatch">
                        <div class="resultMatchInfo">
                            <h2>${playersLob[0]}</h2>
                            <p>Score: <span>${playerScoreOne.score}</span></p>
                            <p>Best reaction time was: <span>${bestReactionTimeOne}</span></p>
                            <p class="yourReactions">Your reactions:</p>
                            <ul id="allReactionsOne">
                            </ul>
                        </div>
                        <div class="resultMatchInfo">
                            <h2>${playersLob[1]}</h2>
                            <p>Score: <span>${playerScoreTwo.score}</span></p>
                            <p>Best reaction time was: <span>${bestReactionTimeTwo}</span></p>
                            <p class="yourReactions">Your reactions:</p>
                            <ul id="allReactionsTwo">
                            </ul>
                        </div>
                    </div>
            </div>`
    }

    const drawTemplate = () => {
        gameOverText.innerHTML = `
        <div id="resultMatch">
            <h1>It's a draw</h1>
                <div id="sumMatch">
                    <div class="resultMatchInfo">
                        <h2>${playersLob[0]}</h2>
                        <p>Score: <span>${playerScoreOne.score}</span></p>
                        <p>Best reaction time was: <span>${bestReactionTimeOne}</span></p>
                        <p class="yourReactions">Your reactions:</p>
                        <ul id="allReactionsOne">
                        </ul>
                    </div>
                    <div class="resultMatchInfo">
                        <h2>${playersLob[1]}</h2>
                        <p>Score: <span>${playerScoreTwo.score}</span></p>
                        <p>Best reaction time was: <span>${bestReactionTimeTwo}</span></p>
                        <p class="yourReactions">Your reactions:</p>
                        <ul id="allReactionsTwo">
                        </ul>
                    </div>
                </div>
        </div>`
    }

    if(playerScoreOne.score > playerScoreTwo.score) {
        playerThatWon = playersLob[0];
        winnerTemplate(playerThatWon);
        allReactionsOne();
        allReactionsTwo();
        gameOverDiv.classList.remove('hide');
    } else if (playerScoreOne.score < playerScoreTwo.score) {
        playerThatWon = playersLob[1];
        winnerTemplate(playerThatWon);
        allReactionsOne();
        allReactionsTwo();
        gameOverDiv.classList.remove('hide');
    } else {
       drawTemplate();
       allReactionsOne();
       allReactionsTwo();
       gameOverDiv.classList.remove('hide');
    }
}

const lobby = () => {

    document.querySelector("#waitingMsg").classList.add("hide");
    document.querySelector("#connectedMsg").classList.remove("hide");
    
    setTimeout(() => {
        document.querySelector("#connectedMsg").classList.add("hide");
        document.querySelector("#startingMsg").classList.remove("hide");
    }, 3500)

    setTimeout(() => {
        lobbyRoom.classList.add('hide');
        playingField.classList.remove('hide');
        document.querySelector("#playerOneName").innerText = playersLob[0];
        document.querySelector("#playerTwoName").innerText = playersLob[1];
    
        connectedPlayersReady();
    }, 6000)
}

const updatePlayersOnline = (players) => {
    playersLob = players;
	document.querySelector('#players-online').innerHTML = players.map(player => `<li class="player"><span class="fas fa-user"></span>${player}</li>`).join("");
}

const scoreBoard = (gameData) => {
    if (gameData.nickname === playersLob[0]) {
        playerScoreOne.score ++;
        playerScoreOne.reactions.push(gameData.reaction)

        const playerOneInfo = document.querySelector('#playerOneInfo');
        playerOneInfo.innerHTML = 
        `
            <p>Score: <span>${gameData.score}</span></p>
            <p>Reaction time: <span>${gameData.reaction}</span></p>
        `
    } else if (gameData.nickname === playersLob[1]){
        playerScoreTwo.score ++;
        playerScoreTwo.reactions.push(gameData.reaction)

        const playerTwoInfo = document.querySelector('#playerTwoInfo');
        playerTwoInfo.innerHTML = 
        `
            <p>Score: <span>${gameData.score}</span></p>
            <p>Reaction time: <span>${gameData.reaction}</span></p>
        `
    }
}

const connectedPlayersReady = () => {
    getReady.play();
    let timeleft = 3;
    const tickingTimer = setInterval(function(){
      if(timeleft <= 0){
        clearInterval(tickingTimer);
        startTime = Date.now();
        virus.classList.remove('hide');
        document.getElementById("countdown").classList.add('hide');
        start.play()
      } else {
        document.getElementById("countdown").innerHTML = ` ${timeleft}`;
        tick.play();
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

const startRound = (clickVirusPosition, randomDelay) => {
    bleep.play()
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
            <h4>Connected as:</h4>
            <p class="connectedNickname">${nickname}</p>`
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
    document.querySelector("#playerOneName").innerText = players[0];
    document.querySelector("#playerTwoName").innerText = players[1];
});


socket.on('new-round', (clickVirusPosition, gameData, randomDelay) => {
    scoreBoard(gameData)
    startRound(clickVirusPosition, randomDelay)
});

socket.on('game-over', (gameData) => {
    scoreBoard(gameData);
    gameOver(gameData);
})

socket.on('create-game-page', lobby);
