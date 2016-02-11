'use strict';

/* jshint -W079 */ // Ignore this error for this import only, as we get a redefinition problem
var test = require('unit.js');
/* jshint +W079 */
var Validation = require('../Validation.js');
var moment = require('moment');

describe( "validateNumberParameter", function() {
	it( 'passes with a number', function() {
		test.bool( Validation.validateNumberParameter( 7 ) ).isTrue();
	});
	it( 'fails if type is not number', function() {
		test.bool( Validation.validateNumberParameter( "7" ) ).isFalse();
	});
	it( 'fails if number is NaN', function() {
		test.bool( Validation.validateNumberParameter( NaN ) ).isFalse();
	});
	it( 'fails if number is less than min', function() {
		test.bool( Validation.validateNumberParameter( 7, 8, 9 ) ).isFalse();
	});
	it( 'fails if number is more than max', function() {
		test.bool( Validation.validateNumberParameter( 7, 5, 6 ) ).isFalse();
	});
	
	it( 'passes on a moment date parse and unix time of a valid ISO8601 string', function() {
		var time = moment( "1984-01-02T03:04:05Z", moment.ISO_8601 ).unix();
		test.bool( Validation.validateNumberParameter(time) ).isTrue();
	});
	it( 'fails on a moment date parse and unix time of an invalid ISO8601 string', function() {
		var time = moment( "03:04:05PM Jan 2nd 1984 UST", moment.ISO_8601 ).unix();
		test.bool( Validation.validateNumberParameter(time) ).isFalse();
	});
});

describe( "validateBooleanParameter", function() {
	it( 'passes with true', function() {
		test.bool( Validation.validateBooleanParameter( true ) ).isTrue();
	});
	it( 'passes with false', function() {
		test.bool( Validation.validateBooleanParameter( false ) ).isTrue();
	});
	it( 'fails with null', function() {
		test.bool( Validation.validateBooleanParameter( null ) ).isFalse();
	});
	it( 'fails with undefined', function() {
		test.bool( Validation.validateBooleanParameter( undefined ) ).isFalse();
	});
	it( 'fails with a number', function() {
		test.bool( Validation.validateBooleanParameter( 1 ) ).isFalse();
	});	
	it( 'fails with a string', function() {
		test.bool( Validation.validateBooleanParameter( 'a' ) ).isFalse();
	});
});

describe( "validateStringParameter", function() {
	it( 'passes with string', function() {
		test.bool( Validation.validateStringParameter( 'a' ) ).isTrue();
	});
	it( 'fails with null', function() {
		test.bool( Validation.validateStringParameter( null ) ).isFalse();
	});
	it( 'fails with undefined', function() {
		test.bool( Validation.validateStringParameter( undefined ) ).isFalse();
	});
	it( 'fails with a number', function() {
		test.bool( Validation.validateStringParameter( 1 ) ).isFalse();
	});	
	it( 'passes with empty string when emptyAllowed === true', function() {
		test.bool( Validation.validateStringParameter( '', true ) ).isTrue();
	});
	it( 'fails with empty string when emptyAllowed === false', function() {
		test.bool( Validation.validateStringParameter( '', false ) ).isFalse();
	});
	it( 'fails with empty string when emptyAllowed === undefined', function() {
		test.bool( Validation.validateStringParameter( '' ) ).isFalse();
	});
});

//Test template
//describe( "suite", function() {
//	before( function() {	
//	});
//	
//	beforeEach( function() {
//	});
//	
//	it( 'case', function() {
//	});
//
//	after( function(){
//	});
//});