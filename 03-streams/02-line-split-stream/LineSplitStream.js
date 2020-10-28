const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
    constructor(options) {
        super(options);

        this.encoding = options.encoding || 'utf8';
        this.output = ''
    }


    _transform(chunk, encoding, callback) {

        const splitString = chunk.toString(this.encoding).split(os.EOL);  //разбиваем чанк по переносам

        const lastKeyChunk = splitString.length - 1; //узнаем ключ последнего элемента чанка

        splitString.forEach((value, i) => {

            this.output += value; //складываем с дредыдущим остатком

            if (i === lastKeyChunk) { //если это последний элемент, то не шлем его, а приплюсуем к следующему
                return;
            }

            this.push(this.output); //отправляем собраный чанк
            this.output = ''; //очищаем остаток
        });

        callback();
    }

    _flush(callback) {
        callback(null, this.output); //шлем остаток
    }


}

module.exports = LineSplitStream;
