/**
 * Socket Controller
 */

const debug = require('debug')('09-simple-chat:socket_controller');
const users = {};

/**
 * Get usernames of online users
 */
function getOnlineUsers() {
	return Object.values(users);
}

/**
 * Handle user disconnecting
 */
function handleUserDisconnect() {
	debug(`Player ${this.id} left the game :(`);

	// broadcast to all connected sockets that this user has left the chat
	if (users[this.id]) {
		this.broadcast.emit('user-disconnected', users[this.id]);
	}

	// remove user from list of connected users
	delete users[this.id];
}

/**
 * Handle incoming chat-message
 */
function handleChatMsg (msg) {
	debug("Someone sent something nice: '%s'", msg);
	//io.emit('chatmsg', msg); // emit to all connected sockets

	// broadcast to all connected sockets EXCEPT ourselves
	this.broadcast.emit('start', msg);
}

/**
 * Handle a new user connecting
 */
function handleRegisterUser(username, callback) {
	debug("Player '%s' connected to the game", username);
	users[this.id] = username;
	callback({
		joinChat: true,
		usernameInUse: false,
		onlineUsers: getOnlineUsers(),
	});

	// broadcast to all connected sockets EXCEPT ourselves
	this.broadcast.emit('new-user-connected', username);

	// broadcast online users to all connected sockets EXCEPT ourselves
	this.broadcast.emit('online-users', getOnlineUsers());
}

module.exports = function(socket) {
	// this = io
	debug(`Player ${socket.id} connected!`);

	socket.on('disconnect', handleUserDisconnect);

	socket.on('chatmsg', handleChatMsg);
	socket.on('register-user', handleRegisterUser);
}
