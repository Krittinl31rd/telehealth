require('dotenv').config();
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');
const { handelSocket } = require('./utility/handelSocket');

const app = express();
const serverOptions = {
    cert: fs.readFileSync("server.crt", "utf8"),
    key: fs.readFileSync("server.key", "utf8"),
};
var server = https.createServer(serverOptions, app);
// const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow requests from this origin
        methods: ["GET", "POST"]
    }
});

// const { v4: uuidV4 } = require('uuid')

// Set up the main Express server
// app.set('view engine', 'ejs')
// app.use(express.static('public'));

// app.get('/room', (req, res) => {
//     res.redirect(`/room/${uuidV4()}`)
// })

// app.get('/room/:roomId', (req, res) => {
//     res.render('room2', { roomId: req.params.roomId })
// })

// app.get('/room2', (req, res) => {
//     res.render('room2')
// })

// Handle socket connections
handelSocket(io);

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Main server is running on port ${PORT}`);
});

// Create a separate server for PeerJS on a different port
// const peerApp = express();
// const peerServer = http.createServer(peerApp);

// const peerJsServer = ExpressPeerServer(peerServer, {
//     debug: true,
//     path: '/'
// });

// peerApp.use('/peerjs', peerJsServer);

// const PEER_PORT = process.env.PEER_PORT;
// peerServer.listen(PEER_PORT, () => {
//     console.log(`PeerJS server is running on port ${PEER_PORT}`);
// });



