var fs = require("fs")
var path = require("path")

var Parser = require("./index")
var getLocation = require("./lib/get-location")

module.exports = ServeLess

function ServeLess(root) {
    return function serve(req, res, params) {
        var appName = params.appName

        res.setHeader("content-type", "text/css")

        getLocation(root, appName, "less", bundleLess)

        function bundleLess(err, uri) {
            if (err) {
                res.statusCode = 404
                return res.end("404 Not Found")
            }

            less(uri, sendPayload)
        }

        function sendPayload(err, payload) {
            if (err) {
                payload = "body:before{ color: red; content: " +
                    JSON.stringify(JSON.stringify(err)) + "; }"

                return res.end(payload)
            }

            try {
                res.end(payload.toCSS())
            } catch (error) {
                payload = "body:before{ color: red; content: " +
                    JSON.stringify(JSON.stringify(error)) + "; }"

                return res.end(payload)
            }
        }
    }
}

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
