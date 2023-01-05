// const { Socket } = require('engine.io');

// /**
//  * @type {Socket}
//  */
const io = require('socket.io')(5000, {
  cors: {
    origin: ['http://localhost:3000'],
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

// admin-chat
const ioAdmin = io.of('/admin');
const userAdmin = [
  {
    username: 'admin',
    password: 'admin',
  },
  {
    username: 'testAd',
    password: 'admin123',
  },
  {
    username: 'test123a',
    password: 'test123',
  },
];
const getIdByUsername = (username) =>
  userAdmin.filter(
    (e) => e.username.toLowerCase() === username.toLowerCase()
  )[0]?.id;

const checkUserAdminByAuth = (auth) =>
  userAdmin.findIndex(
    ({ username, password }) =>
      username === auth.username && password === auth.password
  );
const checkUserAdminByUsername = (username) =>
  userAdmin.findIndex((auth) => auth.username === username);
const key = 'basicsocket<string>';

ioAdmin.use((socket, next) => {
  const { username, password } = socket.handshake.auth;
  const user = checkUserAdminByAuth({ username, password });
  if (user !== -1) {
    const { username } = userAdmin[user];
    socket.user = { username };
    userAdmin[user]['id'] = socket.id;
    next();
  } else if (socket.handshake.auth.token) {
    try {
      const decoded = jwt.verify(socket.handshake.auth.token, key);
      socket.user = decoded;
      console.log(decoded);
      userAdmin[checkUserAdminByUsername(decoded.username)]['id'] = socket.id;
      next();
    } catch (err) {
      next(new Error('Not authorized'));
    }
  } else {
    next(new Error('Not authenticated'));
  }
});

const messagesAdmin = {};

ioAdmin.on('connection', (socket) => {
  socket.emit('token', jwt.sign(socket.user, key));
  socket.on('send-message', (message, { to, room }) => {
    if (room) {
      message = `Room ${room}, "${socket.user.username}": ${message}`;
      messagesAdmin[room]
        ? messagesAdmin[room].push(message)
        : (messagesAdmin[room] = [message]);
      socket.to(room).emit('receive-message', message);
    } else if (to) {
      // console.log(to, userAdmin, getIdByUsername(to));
      if (getIdByUsername(to)) {
        socket
          .to(getIdByUsername(to))
          .emit(
            'receive-message',
            `From "${socket.user.username}": ${message}`
          );
      }
    } else {
      socket.broadcast.emit(
        'receive-message',
        `Public, "${socket.user.username}": ${message}`
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
    socket.emit('receive-message', `Connected by id: ${socket.user.username}`);
  });
});
