import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { socketService } from './services/socket.service';

const PORT = process.env.PORT || 3000;

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.io
socketService.init(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

