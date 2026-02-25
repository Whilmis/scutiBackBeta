import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

import courseRoutes from './routes/course.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import chatRoutes from './routes/chat.routes';
import feedRoutes from './routes/feed.routes';
import skillRoutes from './routes/skill.routes';
import swapRoutes from './routes/swap.routes';
import calendarRoutes from './routes/calendar.routes';
import aiRoutes from './routes/ai.routes';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);
app.use('/orders', orderRoutes);
app.use('/categories', categoryRoutes); // Categories exposed at root level /categories
app.use('/chat', chatRoutes);
app.use('/feed', feedRoutes);
app.use('/skills', skillRoutes);
app.use('/swaps', swapRoutes);
app.use('/calendar', calendarRoutes);
app.use('/ai', aiRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Scuti Backend API is running' });
});

export default app;
