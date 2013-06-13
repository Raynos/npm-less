var fs = require("fs")
var path = require("path")

var Parser = require("./index")

module.exports = less

function less(location, callback) {
    var parser = new Parser({
        paths: [path.dirname(location)],
        filename: path.basename(location)
    })

    fs.readFile(location, function (err, file) {
        if (err) {
            return callback(err)
        }

        parser.parse(String(file), callback)
    })
}
