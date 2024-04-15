import express from 'express';
import { routerV1 } from './routes/routesV1';
import cors from 'cors';

export const app = express();

app.use(express.json());

app.use(
    cors({
        origin: '*',
    })
);
app.use(express.urlencoded({ extended: false }));

app.get('/', function (_, res) {
    res.json({ message: 'Hello World!' });
});

app.use('/api/v1', routerV1);

app.listen(3000, function () {
    console.log('App listening on port 3000!');
});
