'use strict';

var testHelper = require("./test-helper");
var path = require("path");

var buster = require("buster");
var assert = buster.assert;
var refute = buster.refute;

var testee = require("../lib/extension");

buster.testCase("buster-testbed-extension", {

    setUp: function () {
        testHelper.mkdir(testHelper.FIXTURES_ROOT);

        this.group = {
            name: "base",
            environment: "browser",
            rootPath: testHelper.FIXTURES_ROOT,
            group: "path/of/buster.js"
        };
        this.config = {
            addGroup: this.stub().returns({})
        };
        this.testee = testee.create({
            testbeds: ["testbed/**/*.html"],
            tests: "test/"
        });

        testHelper.writeFile("testbed/timeStructure.html");
        testHelper.writeFile("testbed/time/structure/timeStructure.html");
    },

    tearDown: function (done) {
        testHelper.clearFixtures(done);
    },

    "adds a configuration group for every found testbed": function () {

        this.testee.preConfigure(this.group, this.config);

        assert.calledTwice(this.config.addGroup);
        assert.calledWith(this.config.addGroup, "testbed/timeStructure.html", {
            "extends": "base",
            testbed: "testbed/timeStructure.html",
            tests: ["test/timeStructure*.js"]
        });
        assert.calledWith(
            this.config.addGroup,
            "testbed/time/structure/timeStructure.html",
            {
                "extends": "base",
                testbed: "testbed/time/structure/timeStructure.html",
                tests: ["test/time/structure/timeStructure*.js"]
            }
        );
    },

    "sets source property for added group": function () {

        var nGroup = {};
        this.config.addGroup.returns(nGroup);

        this.testee.preConfigure(this.group, this.config);

        assert.equals(nGroup.source, this.group.source);
    }
});