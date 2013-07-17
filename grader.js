#!/usr/bin/env node
/*
Automatically grades files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

View references on the assignment details page for the course, I am lazy
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://thawing-hollows-2865.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var assertWebpageExists = function(url) {
    rest.get(url).on('complete', function(result) {
	if (result instanceof Error) {
	    console.log("%s does not exist. Exiting.", url);
	    process.exit(1);
	}
	return url;
    });
};

var loadUrlHtmlFile = function(url) {
    rest.get(url).on('complete', function(result) {
	return result;
    });
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(html, checksfile) {
    $ = cheerio.load(html);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if (require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <website_url>', 'URL of website to check', clone(assertWebpageExists), URL_DEFAULT)
	.parse(process.argv);
    var html = (program.file) ? fs.readFileSync(program.file) : loadUrlHtmlFile(program.url);
    var checkJson = checkHtmlFile(html, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
