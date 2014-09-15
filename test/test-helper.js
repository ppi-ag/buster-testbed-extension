'use strict';

var mkdirp = require('mkdirp');
var path = require("path");
var fs = require("fs");
var rmrf = require("rimraf");

var MODULE_ROOT = path.resolve(__dirname, "..");
var FIXTURES_ROOT = path.resolve(MODULE_ROOT, ".fixtures");

module.exports = {
    FIXTURES_ROOT: FIXTURES_ROOT,

    mkdir: function (dir) {
        mkdirp.sync(dir);
    },

    writeFile: function (file, contents) {
        file = path.join(FIXTURES_ROOT, file);
        this.mkdir(path.dirname(file));
        contents = contents || "";
        fs.writeFileSync(file, contents);
        return file;
    },

    clearFixtures: function (done) {
        rmrf(FIXTURES_ROOT, function (err) {
            if (err) { console.log(err.toString()); }
            done();
        });
    }
};