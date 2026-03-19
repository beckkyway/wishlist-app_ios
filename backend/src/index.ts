import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

import authRouter from './routes/auth';
import wishlistsRouter from './routes/wishlists';
import itemsRouter from './routes/items';
import reservationsRouter from './routes/reservations';
import contributionsRouter from './routes/contributions';
import shareRouter from './routes/share';
import parseUrlRouter from './routes/parseUrl';
import aiRouter from './routes/ai';
import friendsRouter from './routes/friends';
import walletRouter from './routes/wallet';
import feedRouter from './routes/feed';
import coinDonationsRouter from './routes/coinDonations';
import groupsRouter from './routes/groups';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/auth', authRouter);
app.use('/wishlists', wishlistsRouter);
app.use('/items', itemsRouter);
app.use('/reservations', reservationsRouter);
app.use('/contributions', contributionsRouter);
app.use('/share', shareRouter);
app.use('/parse-url', parseUrlRouter);
app.use('/ai', aiRouter);
app.use('/friends', friendsRouter);
app.use('/wallet', walletRouter);
app.use('/feed', feedRouter);
app.use('/coin-donations', coinDonationsRouter);
app.use('/groups', groupsRouter);

// Error handler must be last
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});

export default app;
