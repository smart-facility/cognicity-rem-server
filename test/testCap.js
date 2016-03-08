'use strict';

/* jshint -W079 */ // Ignore this error for this import only, as we get a redefinition problem
var test = require('unit.js');
/* jshint +W079 */
var Cap = require('../Cap.js');

// Mocked logger we can use to let code run without error when trying to call logger messages
var logger = {
	error:function(){},
	warn:function(){},
	info:function(){},
	verbose:function(){},
	debug:function(){}
};

var cap = new Cap(logger);

describe( "transformFromGeoJson", function() {
	before( function() {
	});

	beforeEach( function() {
	});

	// TODO validate against schema?
	
	it( 'Successful query calls callback with no error and with data', function() {
		test.bool( true ).isTrue(); // FIXME to pass jshint until unit tests are done
		cap.a=1; // FIXME to pass jshint until unit tests are done
	});

	after( function(){
	});
});

describe( "createInfos", function() {
	before( function() {
	});

	beforeEach( function() {
	});

	// TODO state to severity / description
	// TODO description
	// TODO areaDesc
	// TODO area>polygon
	
	it( 'Successful query calls callback with no error and with data', function() {
	});

	after( function(){
	});
});

describe( "createAlert", function() {
	before( function() {
	});

	beforeEach( function() {
	});

	it( 'Successful query calls callback with no error and with data', function() {
	});

	after( function(){
	});
});

// Test template
//	describe( "suite", function() {
//		before( function() {
//		});
//
//		beforeEach( function() {
//		});
//
//		it( 'case', function() {
//		});
//
//		after( function(){
//		});
//	});
