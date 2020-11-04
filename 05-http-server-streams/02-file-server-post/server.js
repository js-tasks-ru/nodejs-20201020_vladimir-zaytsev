const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
    const pathname = url.parse(req.url).pathname.slice(1);
    const pathnameArray = pathname.split('/');


    const filepath = path.join(__dirname, 'files', pathname);

    switch (req.method) {
        case 'POST':

            //передали пустой путь
            if (pathname === '') {
                res.statusCode = 400;
                res.end('Empty filename');
                return;
            }

            //передали вложенность
            if (pathnameArray.length > 1) {
                res.statusCode = 400;
                res.end('Subfolders not supported');
                return;
            }

            let finishWrite = false;
            let errorAction = false;
            let unlinkFile = false;

            const limitStream = new LimitSizeStream({limit: 1000000});
            const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});


            req
                .pipe(limitStream)
                .pipe(writeStream);


            //превысили размер файла
            limitStream.on('error', (err) => {
                errorAction = true;
                unlinkFile = true;

                if (err.code === 'LIMIT_EXCEEDED') {
                    res.statusCode = 413;
                    res.end('File is too big');
                    return;
                }

                res.statusCode = 500;
                res.end('Server Error');

            });


            writeStream
                .on('finish', () => {
                    finishWrite = true;
                })
                .on('error', (error) => {

                    errorAction = true;

                    if (error.code === 'EEXIST') {
                        res.statusCode = 409;
                        res.end('File exists');
                        return;
                    }

                    unlinkFile = true;
                    res.statusCode = 500;
                    res.end('error write');
                })
                .on('close', () => {
                    if (
                        !errorAction //не была вызвана ошибка
                        && finishWrite //загрузка была завершена
                    ) {
                        res.statusCode = 201;
                        res.end('ok');
                    }

                });


            //соединение оборвалось
            res.on('close', () => {

                if (
                    unlinkFile  //пришел флаг что надо удалить загруженное
                    || !res.finished //или соединение оборвалось
                ) {

                    fs.unlink(filepath, (err) => {});
                }
            });


            break;

        default:
            res.statusCode = 501;
            res.end('Not implemented');
    }
});

module.exports = server;

