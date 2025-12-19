module.exports = function initSocket(io, sessionMiddleware, db) {
    const userSocketMap = new Map();

    io.use((socket, next) => {
        sessionMiddleware(socket.request, socket.request.res || {}, next);
    });

    io.on('connection', async (socket) => {
        const userId = socket.request.session.userId;
        let username = 'Guest';

        if (userId) {
            try {
                const user = await db.User.findByPk(userId);
                if (user) {
                    username = user.username;
                    if (!userSocketMap.has(userId)) {
                        userSocketMap.set(userId, new Set());
                    }
                    userSocketMap.get(userId).add(socket.id);
                }
            } catch (err) {
                console.error(err);
            }
        }

        socket.on('chat-message', async (data) => {
            const { message, receiverId } = data;

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

                if (receiverId) {
                    if (userSocketMap.has(userId)) {
                        userSocketMap.get(userId).forEach(id =>
                            io.to(id).emit('chat-message', messageData)
                        );
                    }

                    if (userSocketMap.has(parseInt(receiverId))) {
                        userSocketMap.get(parseInt(receiverId)).forEach(id =>
                            io.to(id).emit('chat-message', messageData)
                        );
                    }
                } else {
                    io.emit('chat-message', messageData);
                }
            } catch (error) {
                console.error('Socket error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
            if (userId && userSocketMap.has(userId)) {
                userSocketMap.get(userId).delete(socket.id);
                if (userSocketMap.get(userId).size === 0) {
                    userSocketMap.delete(userId);
                }
            }
        });
    });
};
