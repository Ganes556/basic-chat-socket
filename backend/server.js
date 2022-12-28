// const { Socket } = require('engine.io');

const e = require('express');

// /**
//  * @type {Socket}
//  */
const io = require('socket.io')(3000, {
  cors: {
    origin: ['http://localhost:5173'],
  },
});
const jwt = require('jsonwebtoken');
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
const userAdmin = [
  {
    username: 'admin',
    password: 'admin',
    name: 'Master1',
  },
  {
    username: 'testAd',
    password: 'admin123',
    name: 'Master2',
  },
  {
    username: 'test123a',
    password: 'test123',
    name: 'Master3',
  },
];

const checkUserAdmin = (auth) =>
  userAdmin.filter(
    ({ username, password }) =>
      username === auth.username && password === auth.password
  );
const key = 'basicsocket<string>';

ioAdmin.use((socket, next) => {
  const { username, password } = socket.handshake.auth;
  const user = checkUserAdmin({ username, password });
  // console.log('kena', socket.handshake.query);
  if (socket.handshake.auth.token) {
    try {
      const decoded = jwt.verify(socket.handshake.auth.token, key);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Not authorized'));
    }
  } else if (user.length > 0) {
    const { name, username } = user[0];
    socket.user = { name, username };
    next();
  } else {
    next(new Error('Not authenticated'));
  }
});

const messagesAdmin = {};

ioAdmin.on('connection', (socket) => {
  socket.emit('token', jwt.sign(socket.user, key));
  socket.on('send-message', (message, { to, room }) => {
    const messageModified = `From "${socket.id}": ${message}`;
    if (room) {
      messagesAdmin[room]
        ? messagesAdmin[room].push(message)
        : (messagesAdmin[room] = [message]);
      socket.to(room).emit('receive-message', messageModified);
    } else if (to) {
      socket.to(to).emit('receive-message', messageModified);
    } else {
      socket.broadcast.emit(
        'receive-message',
        `Public chat, from id:" ${socket.user.name}": ${message}`
      );
    }
  });
  socket.on('join-room', (room, cb) => {
    messagesAdmin[room]
      ? cb([`You joined room: ${room}`, ...messagesAdmin[room]])
      : cb([`You joined room: ${room}`]);
    socket.join(room);
  });
  socket.on('quite-room', (room) => {
    socket.leave(room);
    socket.emit('receive-message', `Connected by id: ${socket.user.name}`);
  });
});
