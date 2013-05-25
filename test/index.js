var test = require("tape")

var npm-less = require("../index")

test("npm-less is a function", function (assert) {
    assert.equal(typeof npm-less, "function")
    assert.end()
})
