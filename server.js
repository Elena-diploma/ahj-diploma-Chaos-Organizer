const http = require('http');
const path = require('path');
const port = process.env.PORT || 8080;
const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('koa2-cors');
const koaStatic = require('koa-static');
const WS = require('ws');
const commandManager = require('./commandManager');
const Router = require('@koa/router');
const app = new Koa();
const router = new Router();
const server = http.createServer(app.callback());
const wsServer = new WS.Server({ server });
const users = [];

app.use(
    cors({
        origin: '*',
        credentials: true,
        'Access-Control-Allow-Origin': true,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    })
);

app.use(koaBody({
    json: true,
    text: true,
    urlencoded: true,
    multipart: true,
}));

const data = [
    {id: '255', message: 'text text text', created: new Date().toLocaleString('ru'), type: 'text'},
    {id: '258', message: 'testtest', created: new Date().toLocaleString('ru'), type: 'text'},
    {id: '275', message: 'link https://google.com https://meduza.io/', created: new Date().toLocaleString('ru'), type: 'link'},
    {id: '345', message: 'ocean.png', created: new Date().toLocaleString('ru'), type: 'image'},
    {id: '346', message: 'Sea - 24216.mp4', created: new Date().toLocaleString('ru'), type: 'video'},
    {id: '678', message: '00199.mp3', created: new Date().toLocaleString('ru'), type: 'audio'},
    {id: '679', message: '41118943.a4.pdf', created: new Date().toLocaleString('ru'), type: 'file'},
    {id: '301', message: 'text text text', created: new Date().toLocaleString('ru'), type: 'text'},
    {id: '105', message: 'Филаде́льфия (с др.-греч. Φιλαδέλφεια — любящая Дельфы) — древнеегипетский город, существовавший с 259—257 до н. э. до V—VI веков. Был основан в правление египетского царя Птолемея II Филадельфа и назван в честь жены и одновременно родной сестры Птолемея Арсинои Филадельфии.', created: new Date().toLocaleString('ru'), type: 'text'},
    {id: '564', message: 'Список творческих работ Олега Даля — список ролей, сыгранных актёром Олегом Далем в театре «Современник» и на других сценических площадках страны', created: new Date().toLocaleString('ru'), type: 'text'},
    {id: '444', message: 'Рубль перешел к росту против евро и стабилен к доллару', created: new Date().toLocaleString('ru'), type: 'text'},
    {id: '454', message: 'https://netology.ru', created: new Date().toLocaleString('ru'), type: 'text'},
    {id: '754', message: '55.89660, 37.61168', created: new Date().toLocaleString('ru'), type: 'geo'},
];


const categories = {
    images: [
        {id: '345', name: 'ocean.png'}
    ],
    audio: [
        {id: '678', name: '00199.mp3'}
    ],
    video: [
        {id: '346', name: 'Sea - 24216.mp4'}
    ],
    links: [
        {id: '275', name: 'https://google.com'},
        {id: '275', name: 'https://yandex.ru'},
    ],
    files: [
        {id: '679', name: '41118943.a4.pdf'}
    ],
}

const fileDir = path.join(__dirname, '/public');
app.use(koaStatic(fileDir));

wsServer.on('connection', (ws, req) => {
    users.push(ws);
    const manager = new commandManager(ws, users, data, fileDir, categories, favorites);
    manager.init();

    router.post('/upload', async ctx => {
        manager.loadFiles(ctx.request.files.file).then((response) => {
            users.forEach((item) => {
                item.send(response);
                item.send(manager.countByCategory());
            });
        });
        ctx.response.status = 204;
    });

    ws.on('close', (event) => {
        console.log(`Disconnected - ${event.code} - ${event.reason}`);
    });

    ws.on('error', (event) => {
        console.log(event.code, event.reason);
    })
});

app.use(router.routes()).use(router.allowedMethods());
server.listen(port, () => console.log('Server started'));