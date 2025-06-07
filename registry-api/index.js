import express from 'express';
import { router as usersRouter } from './controllers/users.js';
const PORT = 3000;

const app = express();
app.use(express.json());

app.use('/users', usersRouter);

app.get('/', (req, res) => {
    res.send('Registry REST API 서버가 실행 중입니다!');
});

app.listen(PORT, () => {
    console.log(`Server running on  http://localhost:${PORT}`);
});
