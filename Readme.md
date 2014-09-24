# buster-testbed-extension

[![Build status](https://secure.travis-ci.org/ppi-ag/buster-testbed-extension.png?branch=master)](http://travis-ci.org/ppi-ag/buster-testbed-extension)

This extension for [Buster.JS](busterjs.org) uses the
[preConfigure](http://docs.busterjs.org/en/latest/developers/extensions/#hook-preConfigure)
extension hook to dynamically add configuration groups at runtime.

**You need version >=0.6.3 of [buster-cli](https://www.npmjs.org/package/buster-cli) to use the extension.**


## Installation

`npm install buster-testbed-extension`


## Usage

You need at least one configuration group in your **Buster.JS** configuration file:
```JavaScript
var config = module.exports;

config["base"] = {
    environment: "browser",
	extensions: [require("buster-testbed-extension")],
	"buster-testbed-extension": {
		testbeds: ["testbed/**/*.html"],
		tests: ...
	}
};
```
The given configuration group loads and configures the extension with the following parameters:

### `testbeds`
Array of glob patterns to select the testbeds, for which configuration groups have to be added.

### `tests`

This parameter contains the information needed to create the glob patterns for selecting the
corresponding JavaScript test files for the testbeds. Depending on the mode, which should be used,
different kinds of informations has to be provided.

**[Simple mode](#simple-mode):**

Directory from which to start with the selection of the JavaScript test files.

**[RegExp mode](#regexp-mode):**

Information about how to modify the testbed path to get the path for the JavaScript test files. 


### Simple mode

The glob pattern for selecting the JavaScript test files is build by:

* starting with the value specified by the [`tests`](#tests) parameter of the extension
* adding the subdirectories of the current testbed
* adding the name of the testbed file with the new extension `js` and an additional asterisk,
  to allow to have more than one JavaScript test file per testbed.

Adding the subdirectories of the testbed means, that the very first part of the
path is omitted. 

#### Example

Directory structure:
```
├── testbed/
│   ├── timeStructure.html
│   ├── time/
│       ├── structure/
│           ├── timeStructure.html
├── test/
│   ├── timeStructure-test.js
│   ├── timeStructure-test2.js
│   ├── time/
│       ├── structure/
│           ├── timeStructure-test.js
│           ├── timeStructure-test2.js
├── buster.js
```

buster.js:
```JavaScript
var config = module.exports;

config["base"] = {
    environment: "browser",
	extensions: [require("buster-testbed-extension")],
	"buster-testbed-extension": {
		testbeds: ["testbed/**/*.html"],
		tests: "test/"
	}
};
```

Resulting configuration at runtime:
```JavaScript
var config = module.exports;

config["base"] = {
    environment: "browser",
	extensions: [require("buster-testbed-extension")],
	"buster-testbed-extension": {
		testbeds: ["testbed/**/*.html"],
		tests: "test/"
	}
};

config["testbed/timeStructure.html"] = {
    extends: "base",
    testbed: "testbed/timeStructure.html",
    tests: ["test/timeStructure*.js"]
};

config["testbed/time/structure/timeStructure.html"] = {
    extends: "base",
    testbed: "testbed/time/structure/timeStructure.html",
    tests: ["test/time/structure/timeStructure*.js"]
};
```

### RegExp mode

In this mode the [`tests`](#tests) parameter of the extension is an array of length 2,
with first element of type `RegExp` and second element a `string` literal.

These elements are used as params for the `string.replace` method,
which is used to transform the path of a testbed to get the path
to the corresponding JavaScript test files.

#### Example

Directory structure:
```
├── test/
│   ├── gen/
│   │   ├── timeStructure.html
│   │   ├── time/
│   │       ├── structure/
│   │           ├── timeStructure.html
│   ├── spec/
│       ├── timeStructure-test.js
│       ├── timeStructure-test2.js
│       ├── time/
│           ├── structure/
│               ├── timeStructure-test.js
│               ├── timeStructure-test2.js
├── buster.js
```

buster.js:
```JavaScript
var config = module.exports;

config["base"] = {
    environment: "browser",
	extensions: [require("buster-testbed-extension")],
	"buster-testbed-extension": {
		testbeds: ["test/gen/**/*.html"],
		tests: [/^test\/gen/, "test/spec"]
	}
};
```

Resulting configuration at runtime:
```JavaScript
var config = module.exports;

config["base"] = {
    environment: "browser",
	extensions: [require("buster-testbed-extension")],
	"buster-testbed-extension": {
		testbeds: ["test/gen/**/*.html"],
		tests: [/^test\/gen/, "test/spec"]
	}
};

config["test/gen/timeStructure.html"] = {
    extends: "base",
    testbed: "test/gen/timeStructure.html",
    tests: ["test/spec/timeStructure*.js"]
};

config["test/gen/time/structure/timeStructure.html"] = {
    extends: "base",
    testbed: "test/gen/time/structure/timeStructure.html",
    tests: ["test/spec/time/structure/timeStructure*.js"]
};
```
