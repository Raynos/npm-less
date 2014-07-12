var fs = require("fs")
var path = require("path")

var Parser = require("./index")

module.exports = less

function less(location, callback, preprocess) {
    var parser = new Parser({
        paths: [path.dirname(location)],
        filename: path.basename(location),
        preprocess: preprocess
    })

    fs.readFile(location, function (err, file) {
        if (err) {
            return callback(err)
        }

        parser.parse(String(file), callback)
    })
}
