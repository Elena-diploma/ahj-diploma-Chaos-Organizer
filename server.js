const http = require('http');
const path = require('path');
const port = process.env.PORT || 8080;
const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('koa2-cors');
const koaStatic = require('koa-static');
const mount = require('koa-mount');
const WS = require('ws');
const messages = require('./rawMessages');
const TextMessage = require('./classes/textMessage');
const MediaMessage = require('./classes/mediaMessage');
const Router = require('@koa/router');
const uuid = require('uuid');
const fs = require("fs");
const mime = require('mime-types');
const app = new Koa();
const router = new Router();
const server = http.createServer(app.callback());
const wsServer = new WS.Server({ server });

//     {id: '255', message: 'text text text', created: new Date().toLocaleString('ru'), type: 'text'},
//     {id: '258', message: 'testtest', created: new Date().toLocaleString('ru'), type: 'text'},
//     {id: '275', message: 'link https://google.com https://meduza.io/', created: new Date().toLocaleString('ru'), type: 'link'},
//     {id: '345', message: 'ocean.png', created: new Date().toLocaleString('ru'), type: 'image'},
//     {id: '346', message: 'Sea - 24216.mp4', created: new Date().toLocaleString('ru'), type: 'video'},
//     {id: '678', message: '00199.mp3', created: new Date().toLocaleString('ru'), type: 'audio'},
//     {id: '679', message: '41118943.a4.pdf', created: new Date().toLocaleString('ru'), type: 'file'},
//     {id: '301', message: 'text text text', created: new Date().toLocaleString('ru'), type: 'text'},
//     {id: '105', message: 'Филаде́льфия (с др.-греч. Φιλαδέλφεια — любящая Дельфы) — древнеегипетский город, существовавший с 259—257 до н. э. до V—VI веков. Был основан в правление египетского царя Птолемея II Филадельфа и назван в честь жены и одновременно родной сестры Птолемея Арсинои Филадельфии.', created: new Date().toLocaleString('ru'), type: 'text'},
//     {id: '564', message: 'Список творческих работ Олега Даля — список ролей, сыгранных актёром Олегом Далем в театре «Современник» и на других сценических площадках страны', created: new Date().toLocaleString('ru'), type: 'text'},
//     {id: '444', message: 'Рубль перешел к росту против евро и стабилен к доллару', created: new Date().toLocaleString('ru'), type: 'text'},
//     {id: '454', message: 'https://netology.ru', created: new Date().toLocaleString('ru'), type: 'text'},
//     {id: '754', message: '55.89660, 37.61168', created: new Date().toLocaleString('ru'), type: 'geo'},
// ];


app.use(
    cors({
        origin: '*',
        'Access-Control-Allow-Origin': true,
        allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
    })
)

const fileDir = path.join(__dirname, '/public')
app.use(mount('/public', koaStatic(fileDir)));

app.use(koaBody({
    json: true,
    text: true,
    urlencoded: true,
    multipart: true,
}));

// инициализируем роутер
app.use(router.routes()).use(router.allowedMethods());

// подтвердим браузеру, что сервер запущен
router.get('/', async (ctx) => {
    ctx.response.body = 'hello';
    ctx.response.status = 200;
});

// получим сообщения
router.get('/messages', async (ctx) => {
    let { amountChildren } = ctx.request.query;
    amountChildren = +amountChildren;

    const messagesPortion = 10;
    let body;
    let rest = messages.length;

    if (amountChildren === 0) {
        body = messages.slice(-messagesPortion);
        rest -= messagesPortion;
    } else {
        amountChildren += messagesPortion;
        const difference = amountChildren - messages.length;

        if (amountChildren > messages.length) {
            body = messages.slice(0, messagesPortion - difference);
        } else {
            body = messages.slice(-amountChildren).slice(0, messagesPortion);
        }

        rest = rest - amountChildren;
    }

    ctx.response.body = JSON.stringify({ body, rest });
    ctx.response.status = 200;
});

// добавим новое сообщение
router.post('/messages', async (ctx) => {
    const id = `message#${uuid.v1()}`;
    ctx.request.body.id = id;
    if (ctx.request.type === 'application/json') {
        messages.push(new TextMessage(ctx.request.body));
        ctx.response.body = id;
    } else if (ctx.request.type === 'multipart/form-data') {
        const { file } = ctx.request.files;
        let link = await new Promise((resolve, reject) => {
            const oldPath = file.path;
            const fileExt = mime.extension(file.type);
            const filename = uuid.v4() + "." + fileExt;
            const newPath = path.join(fileDir, filename);

            const callback = (error) => reject(error);

            const readStream = fs.createReadStream(oldPath);
            const writeStream = fs.createWriteStream(newPath);

            readStream.on('error', callback);
            writeStream.on('error', callback);

            readStream.on('close', () => {
                fs.unlink(oldPath, callback);
                resolve(filename);
            });

            readStream.pipe(writeStream);
        });

        link = 'public/' + link;

        ctx.request.body.link = link;
        ctx.request.body.coords = JSON.parse(ctx.request.body.coords);
        messages.push(new MediaMessage(ctx.request.body));
        ctx.response.body = JSON.stringify({ id, link });
    }
    ctx.response.status = 200;
});

// изменим добавленное сообщение
router.patch('/messages', async (ctx) => {
    const { id, changedOption } = ctx.request.body;
    const messageIndex = messages.findIndex((message) => message.id === id);
    if (messageIndex === -1) {
        ctx.response.body = `Message with id #"${id}" not found!`;
        ctx.response.status = 400;
    } else {
        messages[messageIndex][changedOption] = !messages[messageIndex][changedOption];
        ctx.response.status = 204;
    }
});

wsServer.on('connection', (ws) => {
    ws.on('message', (msg) => {
        // поделимся каждым новым сообщением со всеми пользователями
        [...wsServer.clients]
            .filter(o => o.readyState === WS.OPEN && o !== ws)
            .forEach(o => o.send(msg));
    });
});

server.listen(port, () => console.log('Server started'));