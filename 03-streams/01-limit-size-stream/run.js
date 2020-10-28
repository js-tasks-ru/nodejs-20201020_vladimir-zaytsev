const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const limitStream = new LimitSizeStream({limit: 5, encoding: 'utf-8'});

const r = fs.createReadStream('./r.txt', {highWaterMark: 1});
const w = fs.createWriteStream('./r_copy.txt');

r.on('error', err => {
    console.log('error read', err.code, err.message);
}).pipe(limitStream).on('error', err => {
    console.log('error transform', err.code, err.message);
}).pipe(w).on('error', err => {
    console.log('error write', err.code, err.message);
}).on('finish', _ => {
    console.log('done!');
});