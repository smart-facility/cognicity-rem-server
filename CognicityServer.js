'use strict';

// Validation module, parameter validation functions
var Validation = require('./Validation.js');

/**
 * A CognicityServer object queries against the cognicity database and returns data to be returned
 * to the client via the REST service.
 * @constructor
 * @param {config} config The server configuration object loaded from the configuration file
 * @param {object} logger Configured Winston logger instance
 * @param {object} pg Configured PostGres 'pg' module instance
 */
var CognicityServer = function(
	config,
	logger,
	pg
	){

	this.config = config;
	this.logger = logger;
	this.pg = pg;
};

CognicityServer.prototype = {

	/**
	 * Server configuration
	 * @type {object}
	 */
	config: null,

	/**
	 * Configured Winston logger instance
	 * @type {object}
	 */
	logger: null,

	/**
	 * Configured 'pg' module PostGres interface instance
	 * @type {object}
	 */
	pg: null,

	/**
	 * DB query callback
	 * @callback DataQueryCallback
	 * @param {Error} err An error instance describing the error that occurred, or null if no error
	 * @param {object} data Response data object which is 'result.rows' from the pg module response
	 */

	/**
	 * Perform a query against the database using the parameterized query in the queryObject.
	 * Call the callback with error information or result information.
	 *
	 * @param {object} queryObject Query object for parameterized postgres query
	 * @param {string} queryObject.text The SQL query text for the parameterized query
	 * @param {Array} queryObject.values Values for the parameterized query
	 * @param {DataQueryCallback} callback Callback function for handling error or response data
	 */
	dataQuery: function(queryObject, callback){
		var self = this;

		self.logger.debug( "dataQuery: queryObject=" + JSON.stringify(queryObject) );

		self.pg.connect(self.config.pg.conString, function(err, client, done){
			if (err){
				self.logger.error("dataQuery: " + JSON.stringify(queryObject) + ", " + err);
				done();
				callback( new Error('Database connection error') );
				return;
			}

			client.query(queryObject, function(err, result){
				if (err){
					done();
					self.logger.error( "dataQuery: Database query failed, " + err.message + ", queryObject=" + JSON.stringify(queryObject) );
					callback( new Error('Database query error') );
				} else if (result && result.rows){
					self.logger.debug( "dataQuery: " + result.rows.length + " rows returned" );
					done();
					callback(null, result.rows);
				} else {
					// TODO Can we ever get to this point?
					done();
					callback( new Error('Unknown query error, queryObject=' + JSON.stringify(queryObject)) );
				}
			});
		});
	},

	/**
	 * Count reports within given polygon layer (e.g. wards).
	 * Call the callback function with error or response data.
	 * @param {object} options Configuration options for the query
	 * @param {number} options.start Unix timestamp for start of query period
	 * @param {number} options.end Unix timestamp for end of query period
	 * @param {string} options.polygon_layer Database table for layer of geo data
	 * @param {string} options.point_layer Database table for confirmed reports
	 * @param {string} options.point_layer_uc Database table for unconfirmed reports
	 * @param {DataQueryCallback} callback Callback for handling error or response data
	 */
	getCountByArea: function(options, callback){
		var self = this;

		// Validate options
		var err;
		if ( !Validation.validateNumberParameter(options.start,0) ) err = new Error( "'start' parameter is invalid" );
		if ( !Validation.validateNumberParameter(options.end,0) ) err = new Error( "'end' parameter is invalid" );
		if ( !options.polygon_layer ) err = new Error( "'polygon_layer' option must be supplied" );
		if ( !options.point_layer_uc ) err = new Error( "'point_layer_uc' option must be supplied" );
		if ( !options.point_layer ) err = new Error( "'point_layer' option must be supplied" );
		if (err) {
			callback(err);
			return;
		}

		// SQL
		// Note that references to tables were left unparameterized as these cannot be passed by user
		var queryObject = {
			text: "SELECT 'FeatureCollection' AS type, " +
					"array_to_json(array_agg(f)) AS features " +
				"FROM (SELECT 'Feature' AS type, " +
					"ST_AsGeoJSON(lg.the_geom)::json As geometry," +
					"row_to_json( " +
						"(SELECT l FROM " +
							"(SELECT lg.pkey, " +
								"lg.area_name as level_name, " +
								"lg.parent_name as parent_name, " +
								"lg.counts as counts, " +
								"lg.state as state " +
							") AS l " +
						") " +
					") AS properties " +
					"FROM ( " +
						"SELECT c1.pkey, " +
							"c1.area_name, " +
							"c1.parent_name, " +
							"c1.the_geom, " +
							"c1.counts counts, " +
							"c1.state state " +
						"FROM ( " +
							"SELECT p1.pkey, " +
								"p1.area_name, " +
								"p1.parent_name, " +
								"p1.the_geom, " +
								"agg_counts.counts, " +
								"flooded.state state " +
							"FROM " + options.polygon_layer + " AS p1 " +
							"LEFT OUTER JOIN ( " +
								"SELECT array_to_json(array_agg(counts)) as counts, " + "" +
									"pkey " +
								"FROM ( " +
									"SELECT b.pkey, " +
										"COALESCE(count(a.pkey), 0) as count, " +
										"a.source " +
									"FROM " + options.point_layer + " a, " +
										options.polygon_layer + " b " +
									"WHERE ST_WITHIN(a.the_geom, b.the_geom) AND " +
										"a.created_at >=to_timestamp($1) AND " +
										"a.created_at <= to_timestamp($2) " +
									"GROUP BY b.pkey, " +
										"a.source " +
								") AS counts " +
								"GROUP BY pkey " +
							") as agg_counts " +
							"ON (p1.pkey = agg_counts.pkey) " +
							"LEFT OUTER JOIN ( " +
								"SELECT * " +
								"FROM rem_status r " +
							") as flooded " +
							"ON (p1.pkey=flooded.rw)" +
						") as c1 " +
						"ORDER BY pkey " +
					") AS lg " +
				") AS f;",
			values: [
			    options.start,
			    options.end
			]
		};

		// Call data query
		self.dataQuery(queryObject, callback);
	},

	/**
	 * Set the 'flooded' state of a village.
	 * @param {object} options Options object for the server query
	 * @param {DataQueryCallback} callback Callback for handling error or response data
	 */
	setState: function(options, callback){
		var self = this;

		// Validate options
		var err;
		if ( !Validation.validateNumberParameter(options.id) ) err = new Error( "'id' option is invalid" );
		if ( !Validation.validateNumberParameter(options.state, 0, 4) ) err = new Error( "'state' option is invalid" );
		if ( !Validation.validateStringParameter(options.username) ) err = new Error( "'username' option must be supplied" );
		if (err) {
			callback(err);
			return;
		}
		
		// See if the region is already set
		var queryObject = {
			text: "SELECT rw FROM rem_status WHERE rw=$1;",
			values: [options.id]
		};
		
		// Call data query
		self.dataQuery(queryObject, function(err, data) {
			if (err) {
				// On error, return the error immediately and no data
				callback(err, null);
				return;

			} else {
				if (data.length>0) {
					// Row exists, update
					var updateQueryObject = {
						text: "UPDATE rem_status SET state = $2, last_updated = now() WHERE rw = $1;",
						values: [
						    options.id,
						    options.state
						]
					};
					self.dataQuery(updateQueryObject, callback);
				} else {
					// Row doesn't exist, insert
					var insertQueryObject = {
						text: "INSERT INTO rem_status VALUES ($1,$2);",
						values: [
						    options.id,
						    options.state
						]
					};
					self.dataQuery(insertQueryObject, callback);
				}
			}

			// Store a log of this entry
			var logStateChangeObject = {
				text: "INSERT INTO rem_status_log (rw, state, username) VALUES ($1, $2, $3);",
				values: [
				    options.id,
				    options.state,
				    options.username
				]
			};
			self.dataQuery(logStateChangeObject, function(err, data){
				if (err) {
					self.logger.error("Error logging state change: " + err);
				}
			});
		});
	},

	/**
	 * Get the GeoJSON village data including flooded state in the feature properties.
	 * Call the callback function with error or response data.
	 * @param {object} options Configuration options for the query
	 * @param {string} options.polygon_layer Database table for layer of geo data
	 * @param {DataQueryCallback} callback Callback for handling error or response data
	 */
	getStates: function(options, callback){
		var self = this;

		// Validate options
		var err;
		if ( !options.polygon_layer ) err = new Error( "'polygon_layer' option must be supplied" );
		if (err) {
			callback(err);
			return;
		}

		// SQL
		// Note that references to tables were left unparameterized as these cannot be passed by user
		var queryObject = {
			text: "SELECT 'FeatureCollection' AS type, " +
					"array_to_json(array_agg(f)) AS features " +
				"FROM (SELECT 'Feature' AS type, " +
					"ST_AsGeoJSON(lg.the_geom)::json AS geometry, " +
					"row_to_json( " +
						"(SELECT l FROM " +
							"(SELECT area_name as level_name , " +
							"COALESCE(rs.state,0) as state, " +
							"COALESCE(rs.last_updated, null) as last_updated," +
							"parent_name, " +
							"pkey " +
							"FROM " + options.polygon_layer + " as j " +
							"LEFT JOIN rem_status as rs " +
							"ON rs.rw=j.pkey " +
							"WHERE j.pkey = lg.pkey) " +
						"as l) " +
					") AS properties " +
					"FROM " + options.polygon_layer + " AS lg " +
				") AS f;",
			values: []
		};

		// Call data query
		self.dataQuery(queryObject, callback);
	},

	/**
	 * Get the GeoJSON DIMS states including flooded state in the feature properties.
	 * Call the callback function with error or response data.
	 * @param {object} options Configuration options for the query
	 * @param {string} options.polygon_layer Database table for layer of geo data
	 * @param {DataQueryCallback} callback Callback for handling error or response data
	 */
	getDims: function(options, callback){
		var self = this;

		// Validate options
		var err;
		if ( !options.polygon_layer ) err = new Error( "'polygon_layer' option must be supplied" );
		if (err) {
			callback(err);
			return;
		}

		// SQL
		// Note that references to tables were left unparameterized as these cannot be passed by user
		var queryObject = {
			text: "SELECT 'FeatureCollection' AS type, " +
					"array_to_json(array_agg(f)) AS features " +
				"FROM (SELECT 'Feature' AS type, " +
					"ST_AsGeoJSON(lg.the_geom)::json AS geometry, " +
					"row_to_json( " +
						"(SELECT l FROM " +
							"(SELECT level , " +
							"district_id as pkey " +
							"FROM dims_reports as j " +
							"WHERE district_id = lg.pkey " +
							"ORDER BY created_at DESC " +
							"LIMIT 1 " +
							") " +
						"as l) " +
					") AS properties " +
					"FROM " + options.polygon_layer + " AS lg " +
				") AS f;",
			values: []
		};

		// Call data query
		self.dataQuery(queryObject, callback);
	}

};

//Export our object constructor method from the module
module.exports = CognicityServer;
