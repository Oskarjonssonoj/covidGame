
// SOCKET CONTROLLER


const debug = require('debug')('covidGame:socket_controller');

// General variables
let io = null;
let roundsPlayed = 0
let maxRounds = 10
const users = {};


// Get nicknames of online players 
function getPlayersOnline() {
	return Object.values(users);
}

// Get random coordinates
function randomPosition (range) {
	return Math.floor(Math.random() * range)
};

// Handle the click by the players
function handlePlayerClick(data) {
	
	roundsPlayed ++;
	console.log("games played", roundsPlayed);
	
	const gameData = {
		nickname: data.name,
		score: data.score,
		reaction: data.reaction,
	}

	const randomDelay = Math.floor(Math.random() * 10000);
	
	const clickVirusPosition = {
		width: randomPosition(630),
		height: randomPosition(880)
	}
	// Emit new image
	if (roundsPlayed < maxRounds) {		
		io.emit('new-round', clickVirusPosition, gameData, randomDelay);
	} else if (roundsPlayed === maxRounds){
		io.emit('game-over', gameData)
		roundsPlayed = 0;
	}
}

// Check if two plauers are connected
function checkPlayersOnline(socket) {
    if (Object.keys(users).length === 2) {

        io.emit('create-game-page');

    } else {
        return;
    }
}

// Handle player disconnecting 
function handlePlayerDisconnect() {
	// broadcast to all connected sockets that this user has left the chat
	if (users[this.id]) {
		this.broadcast.emit('user-disconnected', users[this.id]);
	}

	// remove user from list of connected users
	delete users[this.id];
}


// Handle a new player connecting
function handlePlayerRegistration(nickname, callback) {
	debug("Player: '%s' connected to the lobby", nickname);
	users[this.id] = nickname;
	callback({
		joinGame: true,
		nicknameInUse: false,
		onlinePlayers: getPlayersOnline(),
	});

	checkPlayersOnline(this);

	// broadcast to all connected sockets EXCEPT ourselves
	this.broadcast.emit('new-user-connected', nickname);

	// broadcast online users to all connected sockets EXCEPT ourselves
	this.broadcast.emit('players-online', getPlayersOnline());
}


module.exports = function(socket) {
	io = this;

	socket.on('disconnect', handlePlayerDisconnect);
	socket.on('player-click', handlePlayerClick);
	socket.on('register-player', handlePlayerRegistration);
}