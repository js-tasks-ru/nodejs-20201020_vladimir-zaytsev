const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (e) {
        if(ctx.status){
            ctx.throw(ctx.status,ctx.body);
        }
        ctx.throw(500,'FAIL');
    }
});

//объект висящих подписок
const storageSubscribes = new Set();

router.get('/subscribe', async (ctx) => {

    const message = await new Promise(resolve=>{
        storageSubscribes.add(resolve);

        ctx.req.on('close', function() {
            storageSubscribes.delete(resolve);
        });
    });

    ctx.status = 200;
    ctx.body = message;

});


router.post('/publish', async (ctx) => {

    const { message } = ctx.request.body;

    if (!message){
        ctx.throw(400, 'empty message');
    }

    for (const subscribeResolve of storageSubscribes) {
        subscribeResolve(ctx.request.body.message);
    }

    ctx.statusCode = 201;
    ctx.body = {message};
});

app.use(router.routes());

module.exports = app;
