const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
    constructor(options) {

        super(options);

        this.currentStreamSize = 0;
        this.limit = +options.limit || null;

    }

    _transform(chunk, encoding, callback) {

        let error = null;

        if (this.limit !== null) { //если вообще задали лимит

            this.currentStreamSize += chunk.length; //плюсуем текущий размер

            if (this.currentStreamSize > this.limit) { //если размер превысили
                error = new LimitExceededError();
                chunk = null;
            }

        }

        callback(error, chunk)
    }
}

module.exports = LimitSizeStream;
