'use strict';

/* jshint -W079 */ // Ignore this error for this import only, as we get a redefinition problem
var test = require('unit.js');
/* jshint +W079 */
var Cap = require('../Cap.js');

// XML builder used to create XML output
var builder = require('xmlbuilder');
// Validation library for XSD
var xsd = require('libxml-xsd');

// Mocked logger we can use to let code run without error when trying to call logger messages
var logger = {
	error:function(){},
	warn:function(){},
	info:function(){},
	verbose:function(){},
	debug:function(){}
};

var cap = new Cap(logger);

// Generate a basic feature used for testing method
function generateTestObject() {
	return {
    	properties: {
    		state: 1,
    		last_updated: "2016-02-16 10:36:50.568724",
    		level_name: "foo foo",
    		parent_name: "bar"
    	},
    	geometry: {
    		type: "Polygon",
    		coordinates: [
    		    [
    		     	[1, 2],
    		     	[3, 4]
    		    ]
    		]
    	}
    };
}

describe( "transformFromGeoJson", function() {
	it( 'XML output validates against XSD', function(done) {
		xsd.parseFile('test/resources/cap-schema.xsd', function(err, schema){
			var testObject = generateTestObject();
			var alert = cap.createAlert(testObject);
			var xmlDocument = builder.create( {alert:alert} ).end();
			schema.validate(xmlDocument, function(err, validationErrors){
				if (validationErrors) {
					test.fail("Validation failure: " + validationErrors + ", " + xmlDocument);
				}
				test.value( err ).isNull();
				test.value( validationErrors ).isNull();
				done();
			});  
		});
	});
	
	it( 'Invalid XML output fails validation against XSD', function(done) {
		xsd.parseFile('test/resources/cap-schema.xsd', function(err, schema){
			var testObject = generateTestObject();
			// Geometry of an unknown type will fail to produce the INFO element
			testObject.geometry.type = "Unknown";
			var alert = cap.createAlert(testObject);
			var xmlDocument = builder.create( {alert:alert} ).end();
			schema.validate(xmlDocument, function(err, validationErrors){
				if (validationErrors) {
					done();
				}
				test.fail("Validation on invalid object passed, " + xmlDocument);
				done();
			});  
		});
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
	
	it( 'Coordinates are reversed in pairs', function() {
		var testObject = generateTestObject();
		var info = cap.createInfo( testObject );
		
		test.value( info.area.polygon[0] ).startsWith( "2,1 4,3" );
		test.array( info.area.polygon ).hasLength( 1 );
	});

	it( 'Multiple polygons are converted', function() {
		var testObject = generateTestObject();
		testObject.geometry.type = "MultiPolygon";
		testObject.geometry.coordinates = [
		    [
			    [
			        [1, 2],
			        [3, 4]
			    ],
			],
		    [
			    [
			        [5, 6],
			        [7, 8]
			    ]
			]
		];
		var info = cap.createInfo( testObject );
		
		test.value( info.area.polygon[0] ).startsWith( "2,1 4,3" );
		test.value( info.area.polygon[1] ).startsWith( "6,5 8,7" );
		test.array( info.area.polygon ).hasLength( 2 );
	});

	it( 'foo', function() {
	});

	it( 'foo', function() {
	});

	it( 'foo', function() {
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
