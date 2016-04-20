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

describe( "geoJsonToAtomCap", function() {
	
	it( '0 features outputs 0 entries', function() {
		var testObjects = [];
		var atomCap = cap.geoJsonToAtomCap( testObjects );
		test.string( atomCap ).contains('<feed');
		test.string( atomCap ).notContains('<entry');
	});
	
	it( '1 feature outputs 1 entry', function() {
		var testObjects = [generateTestObject()];
		var atomCap = cap.geoJsonToAtomCap( testObjects );
		test.string( atomCap ).contains('<feed');
		test.number( (atomCap.match(/<entry/g) || []).length ).is( 1 );
	});

	it( '2 features outputs 2 entries', function() {
		var testObjects = [generateTestObject(),generateTestObject()];
		var atomCap = cap.geoJsonToAtomCap( testObjects );
		test.string( atomCap ).contains('<feed');
		test.number( (atomCap.match(/<entry/g) || []).length ).is( 2 );
	});

	it( 'Error in Alert means no Entry produced', function() {
		var testObjects = [generateTestObject()];
		testObjects[0].geometry.type = "Unknown";
		var atomCap = cap.geoJsonToAtomCap( testObjects );
		test.string( atomCap ).contains('<feed');
		test.string( atomCap ).notContains('<entry');
	});

});

describe( "createAlert", function() {
	
	it( 'Identifier is URL encoded', function() {
		var testObject = generateTestObject();
		testObject.properties.parent_name = "1<2";
		var alert = cap.createAlert( testObject );
		test.string( alert.identifier ).notContains('<');
	});
	
	it( 'Error in Info generation returns no Alert', function() {
		var testObject = generateTestObject();
		var alert = cap.createAlert( testObject );
		test.value( alert ).isObject();
		// Cause an error in the Alert generation
		testObject.geometry.type = "Unknown";
		alert = cap.createAlert( testObject );
		test.value( alert ).isUndefined();
	});
	
});

describe( "createInfo", function() {	

	it( 'State of 0 causes an error', function() {
		var testObject = generateTestObject();
		testObject.properties.state = 0;
		var info = cap.createInfo( testObject );
		
		test.value( info ).isUndefined();
	});

	it( 'State > 0 does not cause an error', function() {
		var testObject = generateTestObject();
		testObject.properties.state = 1;
		var info = cap.createInfo( testObject );
		
		test.value( info ).isObject();
	});
	
	it( 'Error in Area generation returns no Info', function() {
		var testObject = generateTestObject();
		var info = cap.createInfo( testObject );
		test.value( info ).isObject();
		// Cause an error in the Alert generation
		testObject.geometry.type = "Unknown";
		info = cap.createInfo( testObject );
		test.value( info ).isUndefined();
	});
	
});

describe( "createArea", function() {	
	
	it( 'Coordinates are reversed in pairs', function() {
		var testObject = generateTestObject();
		var area = cap.createArea( testObject );
		
		test.value( area.polygon[0] ).startsWith( "2,1 4,3" );
		test.array( area.polygon ).hasLength( 1 );
	});

	it( 'Multiple polygons are converted', function() {
		var testObject = generateTestObject();
		testObject.geometry.type = "MultiPolygon";
		testObject.geometry.coordinates = [
		    [
			    [
			        [1, 2],
			        [3, 4]
			    ]
			],
		    [
			    [
			        [5, 6],
			        [7, 8]
			    ]
			]
		];
		var area = cap.createArea( testObject );
		
		test.value( area.polygon[0] ).startsWith( "2,1 4,3" );
		test.value( area.polygon[1] ).startsWith( "6,5 8,7" );
		test.array( area.polygon ).hasLength( 2 );
	});
	
	it( 'Unsupported geometry fails conversion', function() {
		var testObject = generateTestObject();
		testObject.geometry.type = "Unknown";
		var area = cap.createArea( testObject );
		
		test.value( area ).isUndefined();
	});
	
	it( 'Polygon with interior rings fails conversion', function() {
		var testObject = generateTestObject();
		testObject.geometry.coordinates = [
		    [
		        [
		            [1, 2],
		            [3, 4]
		        ]
		    ],
		    [
		        [
		         	[5, 6],
		         	[7, 8]
		        ]
		    ]
		];
		var area = cap.createArea( testObject );
		
		test.value( area ).isUndefined();
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
