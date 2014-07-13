var fs = require("fs")
var path = require("path")

var Parser = require("./index")

module.exports = less

function less(location, options, callback) {
    if (typeof options === 'function') {
        callback = options
        options = {}
    }

    options.paths = options.paths || [path.dirname(location)]
    options.filename = options.filename || path.basename(location)
    options.preprocess = options.preprocess || passThrough

    var parser = new Parser(options)

    fs.readFile(location, {encoding: "utf8"}, function (err, src) {
        if (err) {
            return callback(err)
        }

        src = options.preprocess(location, src)
        parser.parse(src, callback)
    })
}

function passThrough (file, src) {
    return src
}
