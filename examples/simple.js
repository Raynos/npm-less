var http = require("http")
var path = require("path")
var Router = require("routes-router")
var ecstatic = require("ecstatic")

var ServeLess = require("../serve")

var router = Router()

router.addRoute("/less/:appName",
    ServeLess(path.join(__dirname, "styles")))
router.addRoute("/", ecstatic({
    root: path.join(__dirname, "static"),
    autoIndex: true
}))

var server = http.createServer(router)

server.listen(9024, function () {
    console.log("demo server listening on port 9024")
})
