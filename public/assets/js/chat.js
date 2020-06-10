const socket = io();

const startEl = document.querySelector('#start');
const chatWrapperEl = document.querySelector('#chat-wrapper');
const usernameForm = document.querySelector('#username-form');
const messageForm = document.querySelector('#message-form');
const messageWrapper = document.querySelector('#gameboard');


const img = document.createElement('img');

function getRandomPosition(element) {
	var x = document.querySelector("#gameboard").offsetHeight-element.clientHeight;
	var y = document.querySelector("#gameboard").offsetWidth-element.clientWidth;
	var randomX = Math.floor(Math.random()* x);
	var randomY = Math.floor(Math.random()* y);
	return [randomX,randomY];
}
window.onload = function (){ 
	var img = document.createElement('img');
	img.setAttribute("style", "position:absolute;");
	img.setAttribute("src", "../assets/images/virus.png");
	document.querySelector("#gameboard").appendChild(img);
	var xy = getRandomPosition(img);
	img.style.top = xy[10] + 'px';
	img.style.left = xy[11] + 'px';
};


function addvirus(){ 
	var img = document.createElement('img');
	img.setAttribute("style", "position:absolute;");
	img.setAttribute("src", "../assets/images/virus.png");
	document.querySelector("#gameboard").appendChild(img);
	var xy = getRandomPosition(img);
	img.style.top = xy[0] + 'px';
	img.style.left = xy[1] + 'px';
};
messageWrapper.addEventListener('click', e => { 

	gameImg = document.querySelector("img")
	console.log(e.target);

	if(e.target !== gameImg){
		console.log("NOT A VIRUS")
	}else{
		e.target.remove();
		addvirus();
	}
});

let username = null;

const addNoticeToChat = (notice) => {
	const noticeEl = document.createElement('li');
	noticeEl.classList.add('list-group-item', 'list-group-item-light', 'notice');

	noticeEl.innerHTML = notice;

	document.querySelector('#messages').appendChild(noticeEl);
}

const addMessageToChat = (msg, ownMsg = false) => {
	const msgEl = document.createElement('li');
	msgEl.classList.add('list-group-item', 'message');
	msgEl.classList.add(ownMsg ? 'list-group-item-primary' : 'list-group-item-secondary');

	const username = ownMsg ? 'You' : msg.username;
	msgEl.innerHTML = `<span class="user">${username}</span>: ${msg.content}`;

	document.querySelector('#messages').appendChild(msgEl);
}

const updateOnlineUsers = (users, i) => {
	console.log(users)
	document.querySelector('#online-users').innerHTML = users.map(user => `<li class="user">Player: ${user}</li>`).join("");
}

// get username from form and emit `register-user`-event to server
usernameForm.addEventListener('submit', e => {
	e.preventDefault();

	username = document.querySelector('#username').value;
	socket.emit('register-user', username, (status) => {
		console.log("Server acknowledged the registration :D", status);

		if (status.joinChat) {
			startEl.classList.add('hide');
			chatWrapperEl.classList.remove('hide');

			updateOnlineUsers(status.onlineUsers);
		}
	});

});

messageForm.addEventListener('submit', e => {
	e.preventDefault();

	const messageEl = document.querySelector('#message');
	const msg = {
		content: messageEl.value,
		username: document.querySelector('#username').value,
	}

	socket.emit('chatmsg', msg);
	addMessageToChat(msg, true);

	messageEl.value = '';
});

socket.on('reconnect', () => {
	if (username) {
		socket.emit('register-user', username, () => {
			console.log("The server acknowledged our reconnect.");
		});
	}
});

socket.on('online-users', (users) => {
	updateOnlineUsers(users);
});

socket.on('new-user-connected', (username) => {
	addNoticeToChat(`${username} connected to the chat 🥳!`);
});

socket.on('user-disconnected', (username) => {
	addNoticeToChat(`${username} left the chat 😢...`);
});

socket.on('chatmsg', (msg) => {
	addMessageToChat(msg);
});
