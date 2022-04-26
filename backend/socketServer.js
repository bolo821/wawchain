const creditManager = require('./routes/creditManager');

const depositeFromCancel = (room) => {
	if (room.user.ready) {
		creditManager.depositeFromCancel(room.user._id);
	}
	if (room.joinedTo.ready) {
		creditManager.depositeFromCancel(room.joinedTo._id);
	}
}
var rooms = [];

module.exports = (server, options) => {
	const io = require('socket.io')(server, options);

	io.on('connection', (socket) => {
		socket.on('disconnect', () => {
	  	});

		// Room Manage
		socket.on('GET_ROOMS', () => {
		  	socket.emit('CURRENT_ROOMS', rooms);
		});
		socket.on('CREATE_ROOM', (data, callback) => {
			let flag = false;
			for (let i=0; i<rooms.length; i++) {
				if (rooms[i].name === data.name) {
					flag = true;
					break;
				}
			}
			if (flag) {
				callback(false);
			} else {
				callback(true);
				rooms.push(data);
				socket.emit('CURRENT_ROOMS', rooms);
				socket.broadcast.emit('CURRENT_ROOMS', rooms);
			}
		});
		socket.on('REMOVE_ROOM', name => {
			rooms = rooms.filter(ele => {
				if (ele.name === name) {
					depositeFromCancel(ele);
					return false;
				} else {
					return true;
				}
			});
			socket.emit('CURRENT_ROOMS', rooms);
			socket.broadcast.emit('CURRENT_ROOMS', rooms);
		});
		socket.on('REQUEST_JOIN', data => {
			for (let i=0; i<rooms.length; i++) {
				if (rooms[i].name === data.name) {
					if (io.sockets.sockets.get(rooms[i].socket))
						io.sockets.sockets.get(rooms[i].socket).emit('REQUEST_JOIN', data);
					rooms[i] = {
						...rooms[i],
						status: 'Joining',
						joiner: data.joiner,
					}
					break;
				}
			}
			socket.emit('CURRENT_ROOMS', rooms);
			socket.broadcast.emit('CURRENT_ROOMS', rooms);
		});
		socket.on('REJECT_JOIN', data => {
			let joiner = null;
			for (var i=0; i<rooms.length; i++) {
				if (rooms[i].name === data.name) {
					joiner = rooms[i].joiner;
					rooms[i] = {
						...rooms[i],
						status: 'Join',
						joiner: null,
					}
					break;
				}
			}
			socket.emit('CURRENT_ROOMS', rooms);
			socket.broadcast.emit('CURRENT_ROOMS', rooms);
			if (io.sockets.sockets.get(joiner))
				io.sockets.sockets.get(joiner).emit('REJECT_JOIN', {
					name: rooms[i].name,
					user: rooms[i].user,
				});
		});
		socket.on('APPROVE_JOIN', data => {
			let joiner = null;
			for (var i=0; i<rooms.length; i++) {
				if (rooms[i].name === data.name) {
					joiner = rooms[i].joiner;
					rooms[i] = {
						...rooms[i],
						status: 'Joined',
						joinedTo: {...data.user, ready: false}
					}
					break;
				}
			}
			socket.emit('CURRENT_ROOMS', rooms);
			socket.broadcast.emit('CURRENT_ROOMS', rooms);
			io.sockets.sockets.get(joiner).emit('APPROVE_JOIN', {
				name: rooms[i].name,
				user: rooms[i].user,
			});
			// io.sockets.sockets.get(joiner).emit('START_GAME', rooms[i].name);
			// socket.emit('START_GAME', rooms[i].name);
		});
		socket.on('CANCEL_JOIN', name => {
			for (let i=0; i<rooms.length; i++) {
				if (rooms[i].name === name) {
					depositeFromCancel(rooms[i]);
					rooms[i] = {
						...rooms[i],
						joiner: null,
						joinedTo: null,
						status: 'Join',
					}

					break;
				}
			}
			socket.emit('CURRENT_ROOMS', rooms);
			socket.broadcast.emit('CURRENT_ROOMS', rooms);
		});
		socket.on('CANCEL_JOINING', name => {
			for (let i=0; i<rooms.length; i++) {
				if (rooms[i].name === name) {
					rooms[i] = {
						...rooms[i],
						joiner: null,
						joinedTo: null,
						status: 'Join',
					}
					if (io.sockets.sockets.get(rooms[i].socket))
						io.sockets.sockets.get(rooms[i].socket).emit('CANCEL_JOINING');
					break;
				}
			}
			socket.emit('CURRENT_ROOMS', rooms);
			socket.broadcast.emit('CURRENT_ROOMS', rooms);
		});
		socket.on('PLAYER_READY', data => {
			for (var i=0; i<rooms.length; i++) {
				if (rooms[i].name === data.name) {
					if (rooms[i].user.email === data.player) {
						rooms[i].user = {
							...rooms[i].user,
							ready: true,
						}
						if (io.sockets.sockets.get(rooms[i].joiner))
							io.sockets.sockets.get(rooms[i].joiner).emit('GET_ROOM', rooms[i]);
						io.emit('GET_ROOM', rooms[i]);
					} else {
						rooms[i].joinedTo = {
							...rooms[i].joinedTo,
							ready: true,
						}
						if (io.sockets.sockets.get(rooms[i].socket))
							io.sockets.sockets.get(rooms[i].socket).emit('GET_ROOM', rooms[i]);
						io.emit('GET_ROOM', rooms[i]);
					}
					break;
				}
			}
		});
		socket.on('PLAYER_READY_CANCEL', data => {
			for (var i=0; i<rooms.length; i++) {
				if (rooms[i].name === data.name) {
					if (rooms[i].user.email === data.player) {
						rooms[i].user = {
							...rooms[i].user,
							ready: false,
						}
						if (io.sockets.sockets.get(rooms[i].joiner))
							io.sockets.sockets.get(rooms[i].joiner).emit('GET_ROOM', rooms[i]);
						io.emit('GET_ROOM', rooms[i]);
					} else {
						rooms[i].joinedTo = {
							...rooms[i].joinedTo,
							ready: false,
						}
						if (io.sockets.sockets.get(rooms[i].socket))
							io.sockets.sockets.get(rooms[i].socket).emit('GET_ROOM', rooms[i]);
						io.emit('GET_ROOM', rooms[i]);
					}
					break;
				}
			}
		})
		socket.on('GET_ROOM', name => {
			for (let i=0; i<rooms.length; i++) {
				if (rooms[i].name === name) {
					socket.emit('GET_ROOM', rooms[i]);
					break;
				}
			}
		});
		socket.on('INIT_READY', name => {
			for (let i=0; i<rooms.length; i++) {
				if (rooms[i].name === name) {
					rooms[i].user = {
						...rooms[i].user,
						ready: false,
					}
					rooms[i].joinedTo = {
						...rooms[i].joinedTo,
						ready: false,
					}
					if (io.sockets.sockets.get(rooms[i].socket))
						io.sockets.sockets.get(rooms[i].socket).emit('GET_ROOM', rooms[i]);
					if (io.sockets.sockets.get(rooms[i].joiner))
						io.sockets.sockets.get(rooms[i].joiner).emit('GET_ROOM', rooms[i]);
				}
				break;
			}
		});
		socket.on('THROW', name => {
			for (let i=0; i<rooms.length; i++) {
				if (rooms[i].name === name) {
					let randomNumber1 = 0;
					let randomNumber2 = 0;
					while (true) {
						randomNumber1 = Math.floor(Math.random() * 6) + 1;
						randomNumber2 = Math.floor(Math.random() * 6) + 1;
						if (randomNumber1 !== randomNumber2) {
							break;
						}
					}

					if (io.sockets.sockets.get(rooms[i].socket))
						io.sockets.sockets.get(rooms[i].socket).emit('THROW_RESULT', {
							creator: randomNumber1,
							joiner: randomNumber2,
						});
					if (io.sockets.sockets.get(rooms[i].joiner))
						io.sockets.sockets.get(rooms[i].joiner).emit('THROW_RESULT', {
							creator: randomNumber1,
							joiner: randomNumber2,
						});
				}
				break;
			}
		});
		socket.on('USER_RECONNECT', data => {
			for (let i=0; i<rooms.length; i++) {
				if (data.email === rooms[i].user.email) {
					rooms[i].socket = data.socket;
				} else if (rooms[i].joinedTo && data.email === rooms[i].joinedTo.email) {
					rooms[i].joiner = data.socket;
				}
			}
		})
	});
}