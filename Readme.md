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
		tests: "test/"
	}
};
```
The given configuration group loads and configures the extension with the following parameters:

### `testbeds`
Array of glob patterns to select the testbeds, for which configuration groups have to be added.

### `tests`
Directory from which to start with the selection of the JavaScript test files by using the
following naming convention.


## Naming convention

The glob pattern for selecting the JavaScript test files is build by:

* starting with the value specified by the `tests` parameter of the extension
* adding the subdirectories of the the current testbed
* adding the name of the testbed file with the new extension `js` and an additional asterisk,
  to allow to have more than one JavaScript test file per testbed.

Adding the subdirectories of the testbed means, that the very first part of the
path is omitted. 

**The convention could yet be changed in a later version, if it turns out,
that it's not useful for common project directory structures.**


## Example

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
Using the previously specified configuration group **base**,
leads to the following configuration at runtime:

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

config["base"] = {
    extends: "base",
    testbed: "testbed/time/structure/timeStructure.html",
    tests: ["test/time/structure/timeStructure*.js"]
};
```