const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', async (req, res) => {
    const pathname = url.parse(req.url).pathname.slice(1);
    const pathnameArray = pathname.split('/');

    const filepath = path.join(__dirname, 'files', pathname);

    switch (req.method) {
        case 'GET':

            if (pathname === '') {
                res.statusCode = 400;
                res.end('Empty filename');
                return;
            }

            if (pathnameArray.length > 1) {
                res.statusCode = 400;
                res.end('Subfolders not supported');
                return;
            }

            const existsSync = await fs.existsSync(filepath);

            if (!existsSync) {
                res.statusCode = 404;
                res.end('Not found');
                return;
            }

            const r = fs.createReadStream(filepath);

            r.on('error', () => {
                res.statusCode = 500;
                res.end('error read');
            }).pipe(res).on('error', () => {
                res.statusCode = 500;
                res.end('error pipe');
            });


            break;

        default:
            res.statusCode = 501;
            res.end('Not implemented');
    }
});



module.exports = server;
