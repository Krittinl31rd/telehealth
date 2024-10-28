let rooms = {};
const moment = require('moment');

exports.handelSocket = (io) => {

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('join-room', (roomId) => {
            socket.join(roomId);

            // Update the user count for the room
            if (!rooms[roomId]) {
                rooms[roomId] = 0;
            }
            rooms[roomId]++;
            // Notify others in the room
            socket.to(roomId).emit('user-connected', socket.id);

            // Send current user count to the room
            io.to(roomId).emit('update-user-count', rooms[roomId]);

            socket.to(roomId).emit('message', { socketId: socket.id, time: moment().format('h:mm a'), msg: 'joined' });

            console.log(`User ${socket.id} joined room ${roomId}`);

            // Handle offer
            socket.on('offer', (data) => {
                socket.to(roomId).emit('offer', { offer: data.offer, socketId: socket.id });
            });

            // Handle answer
            socket.on('answer', (data) => {
                socket.to(data.socketId).emit('answer', { answer: data.answer, socketId: socket.id });
            });

            // Handle ICE candidate
            socket.on('candidate', (data) => {
                socket.to(data.socketId).emit('candidate', { candidate: data.candidate, socketId: socket.id });
            });

            socket.on('media-update', ({ cameraId, micId, socketId }) => {
                socket.to(roomId).emit('media-update', { cameraId, micId, socketId });
            });

            socket.on('message', (msg, socketId, roomId) => {
                io.to(roomId).emit('message', { msg, socketId, time: moment().format('h:mm a') })
            });

            // Handle user disconnection
            socket.on('disconnect', () => {
                rooms[roomId]--;
                if (rooms[roomId] <= 0) {
                    delete rooms[roomId];
                } else {
                    io.to(roomId).emit('update-user-count', rooms[roomId]);
                }
                socket.to(roomId).emit('user-disconnected', socket.id);
                socket.to(roomId).emit('message', { socketId: socket.id, time: moment().format('h:mm a'), msg: 'left' });
                console.log(`User ${socket.id} disconnected from room ${roomId}`);
            });
        });
    });

};