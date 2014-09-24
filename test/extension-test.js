'use strict';

var testHelper = require("./test-helper");
var path = require("path");

var buster = require("buster");
var assert = buster.assert;
var refute = buster.refute;
var match  = buster.sinon.match;

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
    },

    tearDown: function (done) {
        testHelper.clearFixtures(done);
    },

    "adds a configuration group for every found testbed": function () {

        testHelper.writeFile("testbed/timeStructure.html");
        testHelper.writeFile("testbed/time/structure/timeStructure.html");
        this.testee = testee.create({
            testbeds: ["testbed/**/*.html"]
        });

        this.testee.preConfigure(this.group, this.config);

        assert.calledTwice(this.config.addGroup);
    },

    "uses path of testbed as group name": function () {

        testHelper.writeFile("testbed/time/structure/timeStructure.html");
        this.testee = testee.create({
            testbeds: ["testbed/**/*.html"]
        });

        this.testee.preConfigure(this.group, this.config);

        assert.calledWith(
            this.config.addGroup,
            "testbed/time/structure/timeStructure.html"
        );
    },

    "extends from original group": function () {

        testHelper.writeFile("testbed/time/structure/timeStructure.html");
        this.testee = testee.create({
            testbeds: ["testbed/**/*.html"]
        });

        this.testee.preConfigure(this.group, this.config);

        assert.calledWith(
            this.config.addGroup,
            match.any,
            match({
                "extends": "base"
            })
        );
    },

    "uses testbed as testbed": function () {

        testHelper.writeFile("testbed/time/structure/timeStructure.html");
        this.testee = testee.create({
            testbeds: ["testbed/**/*.html"]
        });

        this.testee.preConfigure(this.group, this.config);

        assert.calledWith(
            this.config.addGroup,
            match.any,
            match({
                testbed: "testbed/time/structure/timeStructure.html"
            })
        );
    },

    "uses subfolder of testbed as subfolder for js test files": function () {

        testHelper.writeFile("testbed/time/structure/timeStructure.html");
        this.testee = testee.create({
            testbeds: ["testbed/**/*.html"],
            tests: "test/"
        });

        this.testee.preConfigure(this.group, this.config);

        assert.calledWith(
            this.config.addGroup,
            match.any,
            match({
                tests: ["test/time/structure/timeStructure*.js"]
            })
        );
    },

    "uses regular expressions to build path for js test files": function () {

        testHelper.writeFile("test/gen/time/structure/timeStructure.html");
        this.testee = testee.create({
            testbeds: ["test/gen/**/*.html"],
            tests: [/^test\/gen/, "test/spec"]
        });

        this.testee.preConfigure(this.group, this.config);

        assert.calledWith(
            this.config.addGroup,
            match.any,
            match({
                tests: ["test/spec/time/structure/timeStructure*.js"]
            })
        );
    },

    "throw Error if length of tests array < 2": function () {

        testHelper.writeFile("test/gen/time/structure/timeStructure.html");
        this.testee = testee.create({
            testbeds: ["test/gen/**/*.html"],
            tests: [/^test\/gen/]
        });

        assert.exception(function () {
            this.testee.preConfigure(this.group, this.config);
        }.bind(this), { name: "TypeError", message: "RegExp mode: length" });

    },

    "throw Error if length of tests array > 2": function () {

        testHelper.writeFile("test/gen/time/structure/timeStructure.html");
        this.testee = testee.create({
            testbeds: ["test/gen/**/*.html"],
            tests: [/^test\/gen/, "test/spec", "test/spec"]
        });

        assert.exception(function () {
            this.testee.preConfigure(this.group, this.config);
        }.bind(this), { name: "TypeError", message: "RegExp mode: length" });

    },

    "throw Error if first element is not regexp": function () {

        testHelper.writeFile("test/gen/time/structure/timeStructure.html");
        this.testee = testee.create({
            testbeds: ["test/gen/**/*.html"],
            tests: ["test/spec", "test/spec"]
        });

        assert.exception(function () {
            this.testee.preConfigure(this.group, this.config);
        }.bind(this), { name: "TypeError", message: "RegExp mode: first" });

    },

    "throw Error if second element is not string": function () {

        testHelper.writeFile("test/gen/time/structure/timeStructure.html");
        this.testee = testee.create({
            testbeds: ["test/gen/**/*.html"],
            tests: [/^test\/gen/, /^test\/gen/]
        });

        assert.exception(function () {
            this.testee.preConfigure(this.group, this.config);
        }.bind(this), { name: "TypeError", message: "RegExp mode: second" });

    },

    "sets source property for added group": function () {

        var nGroup = {};
        this.config.addGroup.returns(nGroup);
        testHelper.writeFile("testbed/timeStructure.html");
        this.testee = testee.create({
            testbeds: ["testbed/**/*.html"]
        });

        this.testee.preConfigure(this.group, this.config);

        assert.equals(nGroup.source, this.group.source);
    }

});