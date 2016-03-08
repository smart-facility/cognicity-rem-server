'use strict';

// XML builder used to create XML output
var builder = require('xmlbuilder');
//moment module, JS date/time manipulation library
var moment = require('moment-timezone');

/**
 * CAP tranformer, transforms Peta Jakarta GeoJSON to CAP.
 * @constructor
 * @param {object} logger Configured Winston logger instance
 */
var Cap = function(
	logger
	){

	this.logger = logger;
};

Cap.prototype = {

	/**
	 * Configured Winston logger instance
	 * @type {object}
	 */
	logger: null,

	/**
	 * Transform from Peta Jakarta GeoJSON data to CAP format.
	 * @param {object} features Peta Jakarta GeoJSON features object
	 * @return {string} XML CAP data describing all areas
	 */
	transformFromGeoJson: function( features ) {
		var self = this;
		
		var output = {};
		var infos = self.createInfos( features );
		output.alert = self.createAlert( infos );
		return builder.create( output ).end();
	},
	
	/**
	 * Create a CAP INFO object  for each feature in the GeoJSON data.
	 * @see {@link http://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html#_Toc97699542|3.2.2 "info" Element and Sub-elements}
	 * @param {object} features Peta Jakarta GeoJSON features
	 * @return {object} Array of objects representing INFO nodes suitable for XML conversion by xmlbuilder
	 */
	createInfos: function( features ) {
		var self = this;
		
		var infos = [];
		
		for (var featureIndex=0; featureIndex<features.length; featureIndex++) {
			var feature = features[featureIndex];
			
			var info = {};
			
			info.category = "Met";
			info.event = "FLOODING";
			info.urgency = "Immediate";			
			
			var severity = "";
			var levelDescription = "";
			if ( feature.properties.state === 1 ) {
				severity = "Unknown";
				levelDescription = "AN UNKNOWN LEVEL OF FLOODING - USE CAUTION -";
			} else if ( feature.properties.state === 2 ) {
				severity = "Minor";
				levelDescription = "FLOODING OF BETWEEN 10 and 70 CENTIMETERS";
			} else if ( feature.properties.state === 3 ) {
				severity = "Moderate";
				levelDescription = "FLOODING OF BETWEEN 71 and 150 CENTIMETERS";
			} else if ( feature.properties.state === 4 ) {
				severity = "Severe";
				levelDescription = "FLOODING OF OVER 150 CENTIMETERS";
			}
			info.severity = severity;

			info.certainty = "Observed";
			info.senderName = "JAKARTA EMERGENCY MANAGEMENT AGENCY";
			info.headline = "FLOOD WARNING";
			
			var descriptionTime = moment(feature.properties.last_updated).tz('Asia/Jakarta').format('HH:mm z');
			var descriptionArea = feature.properties.parent_name + ", " + feature.properties.level_name;
			info.description = "AT " + descriptionTime + " THE JAKARTA EMERGENCY MANAGEMENT AGENCY OBSERVED " + levelDescription + " IN " + descriptionArea + ".";

			info.web = "http://petajakarta.org/banjir/id/map";

			info.area = {};
			info.area.areaDesc = feature.properties.level_name + ", " + feature.properties.parent_name;
			
			// Collate array of polygon-describing strings from different geometry types
			info.area.polygon = [];
			var featurePolygons;
			if ( feature.geometry.type === "Polygon" ) {
				featurePolygons = [ feature.geometry.coordinates ];
			} else if ( feature.geometry.type === "MultiPolygon" ) {
				featurePolygons = feature.geometry.coordinates;
			} else {
				self.logger.error( "Cap: createInfos(): Geometry type '" + feature.geometry.type + "' not supported" );
				return;
				// TODO error - geom not supported
			}
			
			// Construct CAP suitable polygon strings (whitespace-delimited WGS84 coordinate pairs)
			// See: http://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html#_Toc97699550 > polygon
			self.logger.debug( "Cap: createInfos(): " + featurePolygons.length + " polygons detected for " + info.area.areaDesc );
			for (var polygonIndex=0; polygonIndex<featurePolygons.length; polygonIndex++) {
				// We assume all geometries to be simple Polygons with a single LineString (LinearRing)
				if ( featurePolygons[polygonIndex].length > 1 ) {
					self.logger.error( "Cap: createInfos(): Polygon with interior rings is not supported" );
					return;
					// TODO error - holes not supported
				}
				
				var polygon = "";
				self.logger.debug( "Cap: createInfos(): " + featurePolygons[polygonIndex][0].length + " points detected in polygon " + polygonIndex );
				for (var pointIndex=0; pointIndex<featurePolygons[polygonIndex][0].length; pointIndex++) {
					var point = featurePolygons[polygonIndex][0][pointIndex];
					polygon += point[1] + "," + point[0] + " ";
				}
				
				info.area.polygon.push( polygon );
			}

			infos.push( info );
		}
		
		return infos;
	},
	
	/**
	 * Create CAP ALERT object.
	 * @see {@link http://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html#_Toc97699527|3.2.1 "alert" Element and Sub-elements}
	 * @param {Array} infos Array of INFO objects to be added to the ALERT
	 * @return {object} Object representing ALERT element for XML conversion by xmlbuilder
	 */
	createAlert: function( infos ) {
		//var self = this;
		
		var alert = {};
		
		alert["@xmlns"] = "urn:oasis:names:tc:emergency:cap:1.2";
		
		alert.identifier = 'BPBD01'; // TODO timestamp?
		alert.sender = 'BPBD.JAKARTA.GOV.ID';
		alert.sent = moment().tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm:ssZ');
		alert.status = "Actual";
		alert.msgType = "Alert";
		alert.scope = "Public";
		
		alert.info = infos;
		
		return alert;
	}

};

// Export our object constructor method from the module
module.exports = Cap;