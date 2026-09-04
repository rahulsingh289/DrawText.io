export const setupCollabSocket = (io) => {
  const activeRooms = new Map(); // noteId -> Map(socketId, userState)

  io.on('connection', (socket) => {
    // Join note canvas room
    socket.on('join-room', ({ noteId, user }) => {
      socket.join(noteId);
      socket.noteId = noteId;
      socket.userData = user || { id: socket.id, name: 'Anonymous Collaborator' };

      if (!activeRooms.has(noteId)) {
        activeRooms.set(noteId, new Map());
      }
      activeRooms.get(noteId).set(socket.id, socket.userData);

      // Notify all clients in the room of the updated active users list
      const roomUsers = Array.from(activeRooms.get(noteId).values());
      io.to(noteId).emit('room-users', roomUsers);
    });

    // Real-time cursor movement
    socket.on('cursor-move', ({ noteId, position, color }) => {
      socket.to(noteId).emit('user-cursor', {
        socketId: socket.id,
        user: socket.userData,
        position,
        color
      });
    });

    // Stroke broadcast (live drawing propagation)
    socket.on('draw-stroke', ({ noteId, stroke }) => {
      socket.to(noteId).emit('stroke-added', stroke);
    });

    // Element update broadcast (moving/resizing/text update)
    socket.on('element-update', ({ noteId, element }) => {
      socket.to(noteId).emit('element-updated', element);
    });

    // Element delete broadcast
    socket.on('element-delete', ({ noteId, elementId }) => {
      socket.to(noteId).emit('element-deleted', elementId);
    });

    // Clear board broadcast
    socket.on('clear-board', ({ noteId }) => {
      socket.to(noteId).emit('board-cleared');
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      const noteId = socket.noteId;
      if (noteId && activeRooms.has(noteId)) {
        activeRooms.get(noteId).delete(socket.id);
        const roomUsers = Array.from(activeRooms.get(noteId).values());
        io.to(noteId).emit('room-users', roomUsers);
        if (activeRooms.get(noteId).size === 0) {
          activeRooms.delete(noteId);
        }
      }
    });
  });
};
