const userSocketMap = require('../utils/userSocketMap');

class CallService {

  static register(socket, io) {

    socket.on('call-user', data =>
      this.callUser(socket, io, data)
    );

    socket.on('call-response', data =>
      this.callResponse(socket, io, data)
    );

    socket.on('webrtc-offer', data =>
      this.offer(socket, io, data)
    );

    socket.on('webrtc-answer', data =>
      this.answer(socket, io, data)
    );

    socket.on('webrtc-ice-candidate', data =>
      this.ice(socket, io, data)
    );

    socket.on('end-call', data =>
      this.end(socket, io, data)
    );
  }

  static emitToUser(io, userId, event, payload) {
    userSocketMap.get(userId).forEach(id =>{
        io.to(id).emit(event, payload)
    }
    );
  }

  static callUser(socket, io, { to }) {
    this.emitToUser(io, to, 'incoming-call', {
      from: socket.userId,
      username: socket.username
    });
  }

  static callResponse(socket, io, { to, accepted }) {
    this.emitToUser(io, to, 'call-response', {
      from: socket.userId,
      accepted
    });
  }

  static offer(socket, io, { to, sdp }) {
    this.emitToUser(io, to, 'webrtc-offer', {
      from: socket.userId,
      sdp
    });
  }

  static answer(socket, io, { to, sdp }) {
    this.emitToUser(io, to, 'webrtc-answer', {
      from: socket.userId,
      sdp
    });
  }

  static ice(socket, io, { to, candidate }) {
    this.emitToUser(io, to, 'webrtc-ice-candidate', {
      from: socket.userId,
      candidate
    });
  }

  static end(socket, io, { to }) {
    this.emitToUser(io, to, 'end-call', {
      from: socket.userId
    });
  }
}

module.exports = CallService;
