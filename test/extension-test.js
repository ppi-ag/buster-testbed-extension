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

    "adds groups only for testbeds with existing js test files if strict option is false": function () {

        testHelper.writeFile("testbed/timeStructure.html");
        testHelper.writeFile("testbed/time/structure/timeStructure.html");
        testHelper.writeFile("test/timeStructure.js");
        this.testee = testee.create({
            testbeds: ["testbed/**/*.html"],
            tests: "test/",
            strict: false
        });

        this.testee.preConfigure(this.group, this.config);

        assert.calledOnce(this.config.addGroup);
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

    "uses path of found testbed for testbed property": function () {

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

    "simple mode: creates path for JS test files for 'tests' path": {

        "with one subfolder": function () {

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

        "with two subfolders": function () {

            testHelper.writeFile("test/gen/time/structure/timeStructure.html");
            this.testee = testee.create({
                testbeds: ["test/gen/**/*.html"],
                tests: "test/spec/"
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

        "not ending with /": function () {

            testHelper.writeFile("test/gen/time/structure/timeStructure.html");
            this.testee = testee.create({
                testbeds: ["test/gen/**/*.html"],
                tests: "test/spec"
            });

            this.testee.preConfigure(this.group, this.config);

            assert.calledWith(
                this.config.addGroup,
                match.any,
                match({
                    tests: ["test/spec/time/structure/timeStructure*.js"]
                })
            );
        }

    },

    "regexp mode:": {

        "creates path for JS test files": function () {

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

        "throws Error if length of tests array < 2": function () {

            testHelper.writeFile("test/gen/time/structure/timeStructure.html");
            this.testee = testee.create({
                testbeds: ["test/gen/**/*.html"],
                tests: [/^test\/gen/]
            });

            assert.exception(
                function () {
                    this.testee.preConfigure(this.group, this.config);
                }.bind(this),
                { name: "TypeError", message: "RegExp mode: length" }
            );
        },

        "throws Error if length of tests array > 2": function () {

            testHelper.writeFile("test/gen/time/structure/timeStructure.html");
            this.testee = testee.create({
                testbeds: ["test/gen/**/*.html"],
                tests: [/^test\/gen/, "test/spec", "test/spec"]
            });

            assert.exception(
                function () {
                    this.testee.preConfigure(this.group, this.config);
                }.bind(this),
                { name: "TypeError", message: "RegExp mode: length" }
            );
        },

        "throws Error if first element is not regexp": function () {

            testHelper.writeFile("test/gen/time/structure/timeStructure.html");
            this.testee = testee.create({
                testbeds: ["test/gen/**/*.html"],
                tests: ["test/spec", "test/spec"]
            });

            assert.exception(
                function () {
                    this.testee.preConfigure(this.group, this.config);
                }.bind(this),
                { name: "TypeError", message: "RegExp mode: first" }
            );
        },

        "throws Error if second element is not string": function () {

            testHelper.writeFile("test/gen/time/structure/timeStructure.html");
            this.testee = testee.create({
                testbeds: ["test/gen/**/*.html"],
                tests: [/^test\/gen/, /^test\/gen/]
            });

            assert.exception(
                function () {
                    this.testee.preConfigure(this.group, this.config);
                }.bind(this),
                { name: "TypeError", message: "RegExp mode: second" }
            );
        }
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