const ChatService = require('../services/ChatService');
const CallService = require('../services/CallService');
const userSocketMap = require('../utils/userSocketMap');

module.exports = function initSocket(io, sessionMiddleware, db) {

  io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
  });

  io.on('connection', async socket => {

    const userId = socket.request.session.userId;
    socket.userId = userId;
    socket.username = 'Guest';

    if (userId) {
      try {
        const user = await db.User.findByPk(userId);
        console.log('user', user);
        if (user) {
          socket.username = user.username;
          console.log('user', userId);
          userSocketMap.add(userId, socket.id);
        }
      } catch (err) {
        console.error(err);
      }
    }

    ChatService.register(socket, io, db);
    CallService.register(socket, io);

    socket.on('disconnect', () => {
      if (userId) {
        userSocketMap.remove(userId, socket.id);
      }
    });
  });
};
