var fs = require("fs")
var path = require("path")

var Parser = require("./index")

module.exports = less

function less(location, callback, preprocess) {
    var options = {
        paths: [path.dirname(location)],
        filename: path.basename(location),
        preprocess: preprocess || passThrough
    }
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
