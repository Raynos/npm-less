var resolve = require("resolve")
var path = require("path")
var url = require("url")
var CompiledFiles = require("compiled-files")

var less = require("./less")

// /css/:appName
module.exports = CompiledFiles({
    compile: function (location, opts, callback) {
        resolve(location, {
            extensions: [".less"]
        }, function (err, fileUri) {
            if (err) {
                return callback(err)
            }

            less(fileUri, function (err, payload) {
                if (err) {
                    return callback(err)
                }

                try {
                    callback(null, payload.toCSS())
                } catch (error) {
                    callback(error)
                }
            })
        })
    },
    sendError: function sendError(req, res, err) {
        return res.end("body:before{ color: red; content: " +
            JSON.stringify(JSON.stringify(err)) + "; }")
    },
    contentType: "text/css",
    findResource: function findResource(req, res, opts) {
        var pathname = url.parse(req.url).pathname
        var parts = pathname.split("/")
        return path.join(opts.root, parts[parts.length - 1])
    }
})
