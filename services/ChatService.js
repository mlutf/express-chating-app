const userSocketMap = require('../utils/userSocketMap');

class ChatService {

  static register(socket, io, db) {
    socket.on('chat-message', data =>
      this.handleMessage(socket, io, db, data)
    );
  }

  static async handleMessage(socket, io, db, data) {
    const { message, receiverId } = data;
    const userId = socket.userId;
    const username = socket.username;

    if (!userId || !message) return;

    try {
      const newMessage = await db.Message.create({
        userId,
        receiverId: receiverId || null,
        message
      });

      const messageData = {
        username,
        message,
        timestamp: newMessage.createdAt,
        senderId: userId,
        receiverId
      };

      // private chat
      if (receiverId) {
        userSocketMap.get(userId).forEach(id =>
          io.to(id).emit('chat-message', messageData)
        );

        userSocketMap.get(parseInt(receiverId)).forEach(id =>
          io.to(id).emit('chat-message', messageData)
        );
      } 
      // global chat
      else {
        io.emit('chat-message', messageData);
      }

    } catch (err) {
      console.error('ChatService error:', err);
    }
  }
}

module.exports = ChatService;
