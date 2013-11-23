# npm-less

<!-- [![build status][1]][2] [![dependency status][3]][4]

[![browser support][5]][6]
 -->
Fix LESS to import a la node require algorithm

## Example

```js
var http = require("http")
var path = require("path")
// Simple http router
var Router = require("routes-router")
// Simple static file server
var ecstatic = require("ecstatic")

var ServeLess = require("npm-less/serve")

var router = Router()

// ServeLess(rootFolder) returns a http handler
// to server less files. The suggestion is to
// serve /less/foo as /styles/foo/index.js or
// /less/bar as /styles/bar.js
router.addRoute("/less/:appName",
    ServeLess(path.join(__dirname, "styles")))
// static server to serve html page for example
router.addRoute("/", ecstatic({
    root: path.join(__dirname, "static"),
    autoIndex: true
}))

var server = http.createServer(router)

server.listen(9024, function () {
    console.log("demo server listening on port 9024")
})

```

## Installation

`npm install npm-less`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Raynos/npm-less.png
  [2]: https://travis-ci.org/Raynos/npm-less
  [3]: https://david-dm.org/Raynos/npm-less.png
  [4]: https://david-dm.org/Raynos/npm-less
  [5]: https://ci.testling.com/Raynos/npm-less.png
  [6]: https://ci.testling.com/Raynos/npm-less
