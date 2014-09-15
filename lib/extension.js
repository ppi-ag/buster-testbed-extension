'use strict';

var glob = require("./file").expand;
var path = require("path");

module.exports = {

    name: "buster-testbed-extension",

    create: function (options) {
        var instance = Object.create(this);
        instance.options = options;
        return instance;
    },

    preConfigure: function (group, config) {

        var testbeds = glob({
            cwd : group.rootPath,
            strict : true
        }, this.options.testbeds);

        var self = this;
        var testsPatterns = testbeds.map(function (testbed) {

            var testsPattern = self.options.tests
                + testbed.split("/").slice(1).join("/");

            return testsPattern.replace(path.extname(testsPattern), "*.js");
        });

        var i;
        for (i = 0; i < testbeds.length; i++) {

            var testbed = testbeds[i];

            config.addGroup(testbed, {
                "extends": group.name,
                testbed: testbed,
                tests: [testsPatterns[i]]
            }).source = group.source;
        }
    }
};
