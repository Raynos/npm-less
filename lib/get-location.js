var fs = require("fs")
var path = require("path")

module.exports = getLocation

// The location is either root/appName/index.less or root/index.less
function getLocation(root, appName, extension, callback) {
    var location = path.join(root, appName, "index." + extension)
    fs.stat(location, function (err, stat) {
        if (stat) {
            return callback(null, location)
        }

        location = path.join(root, appName + "." + extension)

        fs.stat(location, function (err, stat) {
            if (stat) {
                return callback(null, location)
            }

            callback(err)
        })
    })
}
