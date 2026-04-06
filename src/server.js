import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { errors } from 'celebrate';
import cookieParser from 'cookie-parser';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import storiesRoutes from './routes/storiesRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import authRouter from './routes/authRoutes.js';
import { setupSwagger } from './swagger.js';
import corsOptions from './config/corsOptions.js';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(logger);
app.use(express.json());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(cookieParser());

//!ROUTES
app.use('/auth', authRouter);

app.use('/stories', storiesRoutes);
app.use('/users', usersRoutes);
app.use(categoriesRoutes);

//!SWAGGER
setupSwagger(app);

//!ERRORS
app.use(errors());
app.use(notFoundHandler);
app.use(errorHandler);

//! MONGODB connection
await connectMongoDB();

//! Server connection
app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on('error', (err) => {
    console.error('Server error:', err);
  });
