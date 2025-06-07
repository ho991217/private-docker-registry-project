import express from 'express';
import usersRouter from './controllers/users.js';
import imagesRouter from './controllers/images.js';
import auditRouter from './controllers/audit.js';
import path from 'node:path';

const PORT = 3000;

const app = express();
app.use(express.json());

app.use('/users', usersRouter);
app.use('/images', imagesRouter);
app.use('/audit', auditRouter);

app.get('/', (req, res) => {
    res.send('Registry REST API 서버가 실행 중입니다!');
});

app.get('/openapi.json', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'openapi.json'));
});

app.listen(PORT, () => {
    console.log(`Server running on  http://localhost:${PORT}`);
});
