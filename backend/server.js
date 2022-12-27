// const { Socket } = require('engine.io');

// /**
//  * @type {Socket}
//  */
const io = require('socket.io')(3000, {
  cors: {
    origin: ['http://localhost:5173'],
  },
});
const messages = {};
io.on('connection', (socket) => {
  socket.on('send-message', (message, { to, room }) => {
    const messageModified = `From "${socket.id}": ${message}`;
    if (room) {
      messages[room]
        ? messages[room].push(message)
        : (messages[room] = [message]);
      socket.to(room).emit('receive-message', messageModified);
    } else if (to) {
      socket.to(to).emit('receive-message', messageModified);
    } else {
      socket.broadcast.emit(
        'receive-message',
        `Public chat, from id:" ${socket.id}": ${message}`
      );
    }
  });
  socket.on('join-room', (room, cb) => {
    messages[room]
      ? cb([`You joined room: ${room}`, ...messages[room]])
      : cb([`You joined room: ${room}`]);
    socket.join(room);
  });
  socket.on('quite-room', (room) => {
    socket.leave(room);
    socket.emit('receive-message', `Connected by id: ${socket.id}`);
  });
});

const ioAdmin = io.of('/admin');
ioAdmin.use((socket, next) => {
  const { username, password } = socket.handshake.auth;
  if (
    !socket.handshake.auth ||
    !username ||
    !password ||
    username !== 'admin' ||
    password !== 'admin'
  ) {
    next(new Error('Not authenticated'));
  } else {
    next();
    console.log(username, password);
  }
});
ioAdmin.on('connection', (socket) => {});
