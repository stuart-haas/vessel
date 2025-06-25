import express from 'express';
import { createServer } from 'http';
import { apiController } from './api';

const app = express();
const server = createServer(app);

app.use(express.json());
app.use('/api', apiController());

(async () => {
  server.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
})();
