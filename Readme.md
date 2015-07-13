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

* Take the path of the testbed including the file name.
* Replace the first part of the path with the path specified by the [`tests`](#tests) parameter of the extension.
  The number of subdirectories which are replaced, complies to the number of subdirectories of the path in the
  [`tests`](#tests) parameter.
* Change the extension of the file to `js` and add an additional asterisk,
  to allow to have more than one JavaScript test file per testbed.


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
		tests: ["test/spec"]
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
		tests: ["test/spec"]
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
│   ├── testbeds/
│   │   ├── gen/
│   │       ├── timeStructure.html
│   │       ├── time/
│   │           ├── structure/
│   │               ├── timeStructure.html
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
		testbeds: ["test/testbeds/gen/**/*.html"],
		tests: [/^test\/testbeds\/gen/, "test/spec"]
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
		testbeds: ["test/testbeds/gen/**/*.html"],
		tests: [/^test\/testbeds\/gen/, "test/spec"]
	}
};

config["test/testbeds/gen/timeStructure.html"] = {
    extends: "base",
    testbed: "test/testbeds/gen/timeStructure.html",
    tests: ["test/spec/timeStructure*.js"]
};

config["test/testbeds/gen/time/structure/timeStructure.html"] = {
    extends: "base",
    testbed: "test/testbeds/gen/time/structure/timeStructure.html",
    tests: ["test/spec/time/structure/timeStructure*.js"]
};
```

##Changelog

**0.1.2** (25.09.2014)

* Behavior of [simple mode](https://github.com/ppi-ag/buster-testbed-extension#simple-mode) changed

**0.1.1** (24.09.2014)

* [RegExp mode](https://github.com/ppi-ag/buster-testbed-extension#regexp-mode) added
