'use strict';

/* jshint -W079 */ // Ignore this error for this import only, as we get a redefinition problem
var test = require('unit.js');
/* jshint +W079 */
var CognicityServer = require('../CognicityServer.js');
var Database = require('../Database.js');

// Create server with empty objects
// We will mock these objects as required for each test suite
var database = new Database(
	{},
	{},
	{}
);
var server = new CognicityServer(
	{},
	{},
	database
);

// Mocked logger we can use to let code run without error when trying to call logger messages
server.logger = {
	error:function(){},
	warn:function(){},
	info:function(){},
	verbose:function(){},
	debug:function(){}
};
database.logger = server.logger;

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
		oldDataQuery = database.dataQuery;
		database.dataQuery = function(queryOptions, callback){
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
		database.dataQuery = oldDataQuery;
	});
});

describe( "getStates validation", function() {
	var oldDataQuery;
	var dataQueryCalled;
	var callbackErr;
	var callbackData;
	var callbackDataResponse = 'response';

	function createOptions(polygon_layer, minimum_state_filter){
		return {
			polygon_layer: polygon_layer,
			minimum_state_filter: minimum_state_filter
		};
	}

	function callback(err,data) {
		callbackErr = err;
		callbackData = data;
	}

	before( function() {
		oldDataQuery = database.dataQuery;
		database.dataQuery = function(queryOptions, callback){
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
		server.getStates( createOptions('rw', 1), callback );
		test.bool( dataQueryCalled ).isTrue();
		test.value( callbackErr ).isNull();
		test.value( callbackData ).is( callbackDataResponse );
	});

	it( "should throw an error with an invalid 'polygon_layer' parameter", function() {
		server.getStates( createOptions(null, 1), callback );
		test.bool( dataQueryCalled ).isFalse();
		test.object( callbackErr ).isInstanceOf( Error );
		test.undefined( callbackData );
	});

	it( "should throw an error with an invalid 'minimum_state_filter' parameter", function() {
		server.getStates( createOptions('rw', 'abc'), callback );
		test.bool( dataQueryCalled ).isFalse();
		test.object( callbackErr ).isInstanceOf( Error );
		test.undefined( callbackData );
	});

	after( function(){
		database.dataQuery = oldDataQuery;
	});
});

describe( "getDims validation", function() {
	var oldDataQuery;
	var dataQueryCalled;
	var callbackErr;
	var callbackData;
	var callbackDataResponse = 'dollar';

	function createOptions(polygon_layer){
		return {
			polygon_layer: polygon_layer
		};
	}

	function callback(err,data) {
		callbackErr = err;
		callbackData = data;
	}

	before( function() {
		oldDataQuery = database.dataQuery;
		database.dataQuery = function(queryOptions, callback){
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
		server.getDims( createOptions('pound'), callback );
		test.bool( dataQueryCalled ).isTrue();
		test.value( callbackErr ).isNull();
		test.value( callbackData ).is( callbackDataResponse );
	});

	it( "should throw an error with an invalid 'polygon_layer' parameter", function() {
		server.getDims( createOptions(null), callback );
		test.bool( dataQueryCalled ).isFalse();
		test.object( callbackErr ).isInstanceOf( Error );
		test.undefined( callbackData );
	});

	after( function(){
		database.dataQuery = oldDataQuery;
	});
});

describe( "setState validation", function() {
	var oldDataQuery;
	var dataQueryCalled;
	var callbackErr;
	var callbackData;
	var callbackDataResponse;
	var queryOptionsUpdate = false;
	var queryOptionsInsert = false;
	var queryOptionsLog = false;

	function createOptions(id, state, username){
		return {
			id: id,
			state: state,
			username: username
		};
	}

	function callback(err,data) {
		callbackErr = err;
		callbackData = data;
	}

	before( function() {
		oldDataQuery = database.dataQuery;
		database.dataQuery = function(queryOptions, callback){
			if (queryOptions.text.indexOf('UPDATE rem_status ') > -1) queryOptionsUpdate = true;
			if (queryOptions.text.indexOf('INSERT INTO rem_status ') > -1) queryOptionsInsert = true;
			if (queryOptions.text.indexOf('INSERT INTO rem_status_log ') > -1) queryOptionsLog = true;
			dataQueryCalled = true;
			callback(null,callbackDataResponse);
		};
	});

	beforeEach( function() {
		dataQueryCalled = false;
		callbackErr = null;
		callbackData = null;
		queryOptionsUpdate = false;
		queryOptionsInsert = false;
		queryOptionsLog = false;
		callbackDataResponse = [];
	});

	it( "should call the database if parameters are valid", function() {
		server.setState( createOptions(1, 2, 'a'), callback );
		test.bool( dataQueryCalled ).isTrue();
		test.value( callbackErr ).isNull();
		test.value( callbackData ).is( callbackDataResponse );
	});

	it( "should throw an error with an invalid 'id' parameter", function() {
		server.setState( createOptions(null, 2, 'a'), callback );
		test.bool( dataQueryCalled ).isFalse();
		test.object( callbackErr ).isInstanceOf( Error );
		test.undefined( callbackData );
	});

	it( "should throw an error with an invalid 'state' parameter", function() {
		server.setState( createOptions(1, null, 'a'), callback );
		test.bool( dataQueryCalled ).isFalse();
		test.object( callbackErr ).isInstanceOf( Error );
		test.undefined( callbackData );
	});

	it( "should throw an error with an invalid 'username' parameter", function() {
		server.setState( createOptions(1, 2, null), callback );
		test.bool( dataQueryCalled ).isFalse();
		test.object( callbackErr ).isInstanceOf( Error );
		test.undefined( callbackData );
	});

	it( "should insert new DIMS state", function() {
		server.setState( createOptions(1, 2, 'a'), callback );
		test.bool( dataQueryCalled ).isTrue();
		test.value( callbackErr ).isNull();
		test.value( callbackData ).is( callbackDataResponse );
		test.bool(queryOptionsUpdate).isFalse();
		test.bool(queryOptionsInsert).isTrue();
		test.bool(queryOptionsLog).isTrue();
	});

	it( "should update existing DIMS state", function() {
		callbackDataResponse = [1];
		server.setState( createOptions(1, 2, 'a'), callback );
		test.bool( dataQueryCalled ).isTrue();
		test.value( callbackErr ).isNull();
		test.value( callbackData ).is( callbackDataResponse );
		test.bool(queryOptionsUpdate).isTrue();
		test.bool(queryOptionsInsert).isFalse();
		test.bool(queryOptionsLog).isTrue();
	});

	after( function(){
		database.dataQuery = oldDataQuery;
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
