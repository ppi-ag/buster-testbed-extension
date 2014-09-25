'use strict';

var glob = require("./file").expand;
var path = require("path");

function findTestbeds(rootPath, testbedOption) {
    return glob({
        cwd : rootPath,
        strict : true
    }, testbedOption);
}

function createSimpleTestPatterns(testsOption, testbed) {
    var numberOfSubfolders = testsOption.split("/").length - 1;
    var testsPattern = testsOption +
        testbed.split("/").slice(numberOfSubfolders).join("/");
    return testsPattern.replace(path.extname(testsPattern), "*.js");
}

function createTestPatternsByRegularExpressions(testsOption, testbed) {

    if (testsOption.length !== 2) {
        throw new TypeError("RegExp mode: length of array has to be 2!");
    }

    if (!(testsOption[0] instanceof RegExp)) {
        throw new TypeError(
            "RegExp mode: first element is not of type 'RegExp'!"
        );
    }

    if (typeof testsOption[1] !== "string") {
        throw new TypeError(
            "RegExp mode: second element is not of type 'string'!"
        );
    }

    var testsPattern = testbed.replace(
        testsOption[0],
        testsOption[1]
    );
    return testsPattern.replace(path.extname(testsPattern), "*.js");
}

function createTestsPatterns(testbeds, testsOption) {
    return testbeds.map(function (testbed) {
        if (testsOption) {
            if (typeof testsOption === "string") {

                if (!testsOption.match(/\/$/)) {
                    testsOption += "/";
                }

                return createSimpleTestPatterns(
                    testsOption,
                    testbed
                );
            }
            return createTestPatternsByRegularExpressions(
                testsOption,
                testbed
            );
        }
    });
}

function addConfigGroups(group, config, testbeds, testsPatterns) {
    var i;
    for (i = 0; i < testbeds.length; i++) {
        config.addGroup(testbeds[i], {
            "extends": group.name,
            testbed: testbeds[i],
            tests: [testsPatterns[i]]
        }).source = group.source;
    }
}

module.exports = {

    name: "buster-testbed-extension",

    create: function (options) {
        var instance = Object.create(this);
        instance.options = options;
        return instance;
    },

    preConfigure: function (group, config) {
        var testbeds = findTestbeds(group.rootPath, this.options.testbeds);
        var testsPatterns = createTestsPatterns(testbeds, this.options.tests);
        addConfigGroups(group, config, testbeds, testsPatterns);
    }
};
