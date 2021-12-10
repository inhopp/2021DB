const cookie = require('cookie');
const { verify } = require('../modules/jwt');
const { query } = require('../modules/db');

const getIdAndName = socket => socket.handshake.headers['cookie'] && cookie.parse(socket.handshake.headers['cookie']).token && verify(cookie.parse(socket.handshake.headers['cookie']).token) || {};
const updateOnlineList = (io, roomName) => {
	const roomPeople = io.sockets.adapter.rooms.get(roomName) ? Array.from(io.sockets.adapter.rooms.get(roomName)).map(socket_id => ({
		id: io.sockets.sockets.get(socket_id).user_id,
		name: io.sockets.sockets.get(socket_id).name,
	})) : [];

	// notification(알림) to people
	io.to(roomName).emit('UPDATE_ONLINE_USERS', roomPeople);
}

const findSocketById = (io, id) => {
	const sockets = [];
	for (let socket of io.sockets.sockets.values()) {
		if (socket.user_id === id) {
			sockets.push(socket);
		}
	}
	
	return sockets;
};

module.exports = io => {
	io.on('connection', socket => {
		const { id, name } = getIdAndName(socket);

		if (id) {
			findSocketById(io, id).map(socket => socket.disconnect());
			socket.user_id = id;
			socket.name = name;
			socket.join('online');
			updateOnlineList(io, 'online');
			console.log(`JOIN ONLINE ${id}`);
		} else {
			socket.disconnect();
		}

		socket.on('CHAT_MESSAGE', async msg => {
			const targetSockets = findSocketById(io, msg.targetId);

			const queryResult = await query(`SELECT is_at_chatroom from users where id = '${msg.targetId}';`);
			let is_at_chatroom;
			queryResult.forEach(result => {
				is_at_chatroom = result.is_at_chatroom;
			})
			const in_this_room = (is_at_chatroom == socket.user_id ? 1 : 0);

			await query(`INSERT into message(from_id, to_id, text, date_time, is_read) values('${socket.user_id}', '${msg.targetId}', '${msg.message}', '${msg.created_at}', '${in_this_room}');`);
			if(msg.is_rendezvous) {
				const quaryResult = await query(`SELECT message_id from message where from_id = '${socket.user_id}' and date_time = '${msg.created_at}';`);
				const message_id = quaryResult[0].message_id;
				await query(`INSERT into rendezvous_message(message_id, set_time, building, floor, ssid) values('${message_id}', '${msg.set_time}', '${msg.building}', '${msg.floor}', '${msg.ssid}');`);
			}

			if (targetSockets.length > 0) {
				targetSockets.forEach(soc => soc.emit('CHAT_MESSAGE', {
					message: msg.message,
					from_id: socket.user_id,
					from_name: socket.name,
					created_at: msg.created_at,
					is_read: in_this_room,
					is_rendezvous: msg.is_rendezvous,
					set_time: msg.set_time,
					building: msg.building,
					floor: msg.floor,
					ssid: msg.ssid
				}));
			}
		});

		socket.on("disconnect", () => {0
			if (socket.user_id) {
				socket.leave('online');
				updateOnlineList(io, 'online');
				console.log(`LEAVE ONLINE ${socket.user_id}`);
			}
		});
	});
};