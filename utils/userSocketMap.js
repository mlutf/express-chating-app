const userSocketMap = new Map();

module.exports = {
  add(userId, socketId) {
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socketId);
  },

  remove(userId, socketId) {
    if (userSocketMap.has(userId)) {
      userSocketMap.get(userId).delete(socketId);
      if (userSocketMap.get(userId).size === 0) {
        userSocketMap.delete(userId);
      }
    }
  },

  get(userId) {
    return userSocketMap.get(userId) || [];
  }
};
