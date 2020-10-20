function sum(a, b) {

    if (
        typeof a !== "number"
        || typeof b !== "number"
    ) {
        throw TypeError('not number');
    }
    return a + b;
}

module.exports = sum;
