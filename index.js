/*jshint maxcomplexity: 1023 */
var fs = require("fs")
var path = require("path")
var url = require("url")
var util = require("util")
var less = require("less")
var request = require("request")
var resolve = require("resolve")

var isUrlRe = /^(?:https?:)?\/\//i
var hasQuery = /^(?:[a-z-]+:|\/)/

var Parser = less.Parser

Parser.importer = function (file, currentFileInfo, callback, env) {
    var pathname, dirname, data,
        newFileInfo = {
            relativeUrls: env.relativeUrls,
            entryPath: currentFileInfo.entryPath,
            rootpath: currentFileInfo.rootpath,
            rootFilename: currentFileInfo.rootFilename
        }

    function parseFile(e, data) {
        if (e) { return callback(e) }

        env = new less.tree.parseEnv(env)
        env.processImports = false

        var j = file.lastIndexOf("/")

        // Pass on an updated rootpath if path of imported
        // file is relative and file is in a (sub|sup) directory
        //
        // Examples:
        // - If path of imported file is "module/nav/nav.less"
        //      and rootpath is "less/", then rootpath should
        //      become "less/module/nav/"
        // - If path of imported file is "../mixins.less"
        //      and rootpath is "less/", then rootpath should
        //      become "less/../"
        if(newFileInfo.relativeUrls && !hasQuery.test(file) && j !== -1) {
            var relativeSubDirectory = file.slice(0, j+1)
            // append (sub|sup) directory path of imported file
            newFileInfo.rootpath = newFileInfo.rootpath + relativeSubDirectory
        }
        newFileInfo.currentDirectory = pathname.replace(/[^\\\/]*$/, "")
        newFileInfo.filename = pathname

        // avoid preprocessing the same file more than once
        if (!env.contents[pathname]) data = Parser.preprocess(pathname, data)

        // Updating top importing parser content cache.
        env.contents[pathname] = data
        env.currentFileInfo = newFileInfo
        var parser = new Parser(env)
        parser.parse(data, function (e, root) {
            callback(e, root, pathname)
        })
    }

    var isUrl = isUrlRe.test( file )
    if (isUrl || isUrlRe.test(currentFileInfo.currentDirectory)) {
        if (request === undefined) {
            try { request = require("request") }
            catch(e) { request = null }
        }
        if (!request) {
            return callback({
                type: "File",
                message: "optional dependency 'request' required" +
                    " to import over http(s)\n"
            })
        }

        var urlStr = isUrl ? file :
            url.resolve(currentFileInfo.currentDirectory, file)
        var urlObj = url.parse(urlStr)

        request.get(urlStr, function (error, res, body) {
            if (res.statusCode === 404) {
                return callback({
                    type: "File",
                    message: "resource '" + urlStr + "' was not found\n"
                })
            }
            if (!body) {
                util.error( "Warning: Empty body (HTTP " +
                    res.statusCode + ") returned by '" + urlStr + "'")
            }
            if (error) {
                return callback({
                    type: "File",
                    message: "resource '" + urlStr +
                        "' gave this Error:\n  " + error + "\n"
                })
            }
            pathname = urlStr
            dirname = urlObj.protocol + "//" + urlObj.host +
                urlObj.pathname.replace(/[^\/]*$/, "")
            parseFile(null, body)
        })
    } else {
        var paths = [currentFileInfo.currentDirectory].concat(env.paths)
        paths.push(".")

        for (var i = 0; i < paths.length; i++) {
            try {
                pathname = path.join(paths[i], file)
                fs.statSync(pathname)
                break
            } catch (e) {
                pathname = null
            }
        }

        var folder = env.paths[0]
        var targetFile = file.replace(/\.less$/, "")

        if (targetFile[0] !== ".") {
            var filePath

            try {
                filePath = resolve.sync(targetFile, {
                    basedir: folder,
                    extensions: [".css", ".less"],
                    packageFilter: function (pkg) {
                        pkg.main = pkg.style
                        return pkg
                    }
                })
            } catch (err) {
                return parseFile(err)
            }

            pathname = filePath
        } else {
            var filepath = path.join(folder, targetFile)
            var filepathWithLess = filepath + ".less"
            var pkginfo = path.join(filepath, "package.json")
            var indexFile = path.join(filepath, "index.less")

            if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
                pathname = filepath
            } else if (fs.existsSync(filepathWithLess)) {
                pathname = filepathWithLess
            } else if (fs.existsSync(pkginfo)) {
                var info = JSON.parse(fs.readFileSync(pkginfo))
                pathname = path.join(filepath, info.less || info.style || "index.less")
            } else if (fs.existsSync(indexFile)) {
                pathname = indexFile
            }
        }

        if (!pathname) {
            return callback({
                type: "File",
                message: "'" + file + "' wasn't found"
            })
        }

        if (env.syncImport) {
            try {
                data = fs.readFileSync(pathname, "utf-8")
                parseFile(null, data)
            } catch (e) {
                parseFile(e)
            }
        } else {
            fs.readFile(pathname, "utf-8", parseFile)
        }
    }
}

module.exports = function (opts) {
    var p = new Parser(opts)
    Parser.preprocess = opts.preprocess
    return p
}
