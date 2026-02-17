
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma'; // Adjust based on your prisma location

interface AuthSocket extends Socket {
    user?: any;
}

class SocketService {
    private static instance: SocketService;
    private io: SocketIOServer | null = null;

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public init(httpServer: HttpServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: "*", // Adjust for production
                methods: ["GET", "POST"]
            }
        });

        // Authentication Middleware
        this.io.use(async (socket: AuthSocket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

                if (!token) {
                    return next(new Error('Authentication error'));
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
                socket.user = decoded;
                next();
            } catch (err) {
                next(new Error('Authentication error'));
            }
        });

        this.io.on('connection', (socket: AuthSocket) => {
            console.log(`User connected: ${socket.user?.id}`);

            // Join user-specific room
            socket.join(socket.user?.id);

            // Join conversation room
            socket.on('join_conversation', (conversationId: string) => {
                console.log(`User ${socket.user?.id} joined conversation ${conversationId}`);
                socket.join(`conversation_${conversationId}`);
            });

            // Handle typing events (Optional)
            socket.on('typing', (data: { conversationId: string, isTyping: boolean }) => {
                socket.to(`conversation_${data.conversationId}`).emit('typing', {
                    userId: socket.user?.id,
                    isTyping: data.isTyping
                });
            });

            socket.on('disconnect', () => {
                console.log('User disconnected');
            });
        });
    }

    public emitToRoom(room: string, event: string, data: any) {
        if (this.io) {
            this.io.to(room).emit(event, data);
        }
    }

    // Helper specifically for conversations
    public emitNewMessage(conversationId: string, message: any) {
        this.emitToRoom(`conversation_${conversationId}`, 'receive_message', message);
    }
}

export const socketService = SocketService.getInstance();
