import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import router from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import swaggerRouter from './swagger-setup.js';

const setupServer = () => {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  app.use(cookieParser());
  app.use('/', router);
  app.use('/api-docs', swaggerRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
};

export default setupServer;
