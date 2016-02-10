'use strict';

/* jshint -W079 */ // Ignore this error for this import only, as we get a redefinition problem
var test = require('unit.js');
/* jshint +W079 */
var CognicityServer = require('../CognicityServer.js');

// Create server with empty objects
// We will mock these objects as required for each test suite
var server = new CognicityServer(
	{},
	{},
	{}
);

// Mocked logger we can use to let code run without error when trying to call logger messages
server.logger = {
	error:function(){},
	warn:function(){},
	info:function(){},
	verbose:function(){},
	debug:function(){}
};

describe( "dataQuery", function() {
	var connectionWillErr = false;
	var queryWillErr = false;

	var lastErr = null;
	var lastData = null;
	var callback = function(err,data) {
		lastErr = err;
		lastData = data;
	};
	var doneCalled = false;
	var doneFunction = function() {
		doneCalled = true;
	};

	before( function() {
		server.config.pg = {};
		var pgClientObject = {
			query: function(queryObject, queryHandler) {
				if (queryWillErr) queryHandler(new Error(), null);
				else queryHandler(null, {rows:[]});
			}
		};
		server.pg = {
			connect: function(conString, pgConnectFunction) {
				if (connectionWillErr) pgConnectFunction(new Error(), pgClientObject, doneFunction);
				else pgConnectFunction(null, pgClientObject, doneFunction);
			}
		};
	});

	beforeEach( function() {
		connectionWillErr = false;
		queryWillErr = false;
		lastErr = null;
		lastData = null;
		doneCalled = false;
	});

	it( 'Successful query calls callback with no error and with data', function() {
		server.dataQuery({},callback);
		test.value( lastErr ).is( null );
		test.value( lastData instanceof Object ).is( true );
	});

	it( 'Connection failure calls callback with error and no data', function() {
		connectionWillErr = true;
		server.dataQuery({},callback);
		test.value( lastErr instanceof Error ).is( true );
		test.value( lastData ).is( undefined );
	});

	it( 'Query failure calls callback with error and no data', function() {
		queryWillErr = true;
		server.dataQuery({},callback);
		test.value( lastErr instanceof Error ).is( true );
		test.value( lastData ).is( undefined );
	});

	after( function(){
		server.config = {};
	});
});

describe( "getCountByArea validation", function() {
	var oldDataQuery;
	var dataQueryCalled;
	var callbackErr;
	var callbackData;
	var callbackDataResponse = 'hydrogen';

	function createOptions(start,end,polygon_layer,point_layer_uc,point_layer){
		return {
			start: start,
			end: end,
			polygon_layer: polygon_layer,
			point_layer_uc: point_layer_uc,
			point_layer: point_layer
		};
	}

	function callback(err,data) {
		callbackErr = err;
		callbackData = data;
	}

	before( function() {
		oldDataQuery = server.dataQuery;
		server.dataQuery = function(queryOptions, callback){
			dataQueryCalled = true;
			callback(null,callbackDataResponse);
		};
	});

	beforeEach( function() {
		dataQueryCalled = false;
		callbackErr = null;
		callbackData = null;
	});

	it( "should call the database if parameters are valid", function() {
		server.getCountByArea( createOptions(1, 2, 'helium', 'strontium', 'neon'), callback );
		test.bool( dataQueryCalled ).isTrue();
		test.value( callbackErr ).isNull();
		test.value( callbackData ).is( callbackDataResponse );
	});

	it( "should throw an error with an invalid 'start' parameter", function() {
		server.getCountByArea( createOptions('mercury', 2, 'helium', 'strontium', 'neon'), callback );
		test.bool( dataQueryCalled ).isFalse();
		test.object( callbackErr ).isInstanceOf( Error );
		test.undefined( callbackData );
	});

	it( "should throw an error with an invalid 'end' parameter", function() {
		server.getCountByArea( createOptions(1, 'platinum', 'helium', 'strontium', 'neon'), callback );
		test.bool( dataQueryCalled ).isFalse();
		test.object( callbackErr ).isInstanceOf( Error );
		test.undefined( callbackData );
	});

	it( "should throw an error with an invalid 'polygon_layer' parameter", function() {
		server.getCountByArea( createOptions(1, 2, null, 'strontium', 'neon'), callback );
		test.bool( dataQueryCalled ).isFalse();
		test.object( callbackErr ).isInstanceOf( Error );
		test.undefined( callbackData );
	});

	it( "should throw an error with an invalid 'point_layer_uc' parameter", function() {
		server.getCountByArea( createOptions(1, 2, 'helium', null, 'neon'), callback );
		test.bool( dataQueryCalled ).isFalse();
		test.object( callbackErr ).isInstanceOf( Error );
		test.undefined( callbackData );
	});

	it( "should throw an error with an invalid 'point_layer' parameter", function() {
		server.getCountByArea( createOptions(1, 2, 'helium', 'strontium', null), callback );
		test.bool( dataQueryCalled ).isFalse();
		test.object( callbackErr ).isInstanceOf( Error );
		test.undefined( callbackData );
	});

	after( function(){
		server.dataQuery = oldDataQuery;
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
