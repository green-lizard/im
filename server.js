import express from 'express'
import SocketIo from 'socket.io'
import http from 'http'

let app = express()
let server = http.Server(app)
let io = SocketIo(server) // 把express注入到 socket.io中

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html')
});

var onlines = {}

// 为每一个连接用户创建一个 connentfd
io.on('connection', (socket) => {

	socket.on('online', ({username}) => {
		let onlinArray = Object.values(onlines)
		if (onlinArray.length) {
			socket.emit('room state', `${onlinArray.join(',')} 正在当前聊天室中`)
		}

		onlines[socket.id] = username
		io.emit('room state', `${username}加入了聊天室`);
	})

	socket.on('disconnect', () => {
		io.emit('room state', `${onlines[socket.id]}离开了聊天室`)
		delete onlines[socket.id];
	});

	socket.on('chat message', (msg) => {
		socket.broadcast.emit('chat message', `${onlines[socket.id]}说: ${msg}`);
	})
})



server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
