'use strict';

// XML builder used to create XML output
var builder = require('xmlbuilder');
// moment module, JS date/time manipulation library
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
	 * Transform from petajakarta.org GeoJSON data to ATOM feed of CAP format XML data.
	 * @param {object} features Peta Jakarta GeoJSON features object
	 * @return {string} XML CAP data describing all areas
	 */
	geoJsonToAtomCap: function( features ) {
		var self = this;
		
		var feed = {
			"@xmlns": "http://www.w3.org/2005/Atom",
			id: 'https://rem.petajakarta.org/data/api/v2/rem/flooded',
			title: 'petajakarta.org Flood Affected Areas',
			updated: moment().tz('Asia/Jakarta').format(),
			author: {
				name: 'petajakarta.org',
				uri: 'https://petajakarta.org/'
			},
			entry: []
		};
		
		for (var featureIndex = 0; featureIndex < features.length; featureIndex++) {
			var feature = features[featureIndex];
			
			var alert = self.createAlert( feature );
			// If alert creation failed, don't create the entry
			if (!alert) {
				continue;
			}
			
			feed.entry.push({
				// Note, this ID does not resolve to a real resource - but enough information is contained in the URL that we could resolve the flooded report at the same point in time
				id: 'https://rem.petajakarta.org/data/api/v2/rem/flooded?parent_name='+encodeURI(feature.properties.parent_name)+'&level_name='+encodeURI(feature.properties.level_name)+'&time='+encodeURI(moment.tz(feature.properties.last_updated, 'Asia/Jakarta').format('YYYY-MM-DDTHH:mm:ssZ')),
				title: alert.identifier + " Flood Affected Area",
				updated: moment.tz(feature.properties.last_updated, 'Asia/Jakarta').format('YYYY-MM-DDTHH:mm:ssZ'),
				content: {
					"@type": "text/xml",
					alert: alert
				}
			});
		}
		
		return builder.create( {feed:feed} ).end();
	},
	
	/**
	 * Create CAP ALERT object.
	 * @see {@link http://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html#_Toc97699527|3.2.1 "alert" Element and Sub-elements}
	 * @param {object} feature petajakarta.org GeoJSON feature
	 * @return {object} Object representing ALERT element for XML conversion by xmlbuilder
	 */
	createAlert: function( feature ) {
		var self = this;
		
		var alert = {};
		
		alert["@xmlns"] = "urn:oasis:names:tc:emergency:cap:1.2";
		
		var identifier = feature.properties.parent_name + "." + feature.properties.level_name + "." + moment.tz(feature.properties.last_updated, 'Asia/Jakarta').format('YYYY-MM-DDTHH:mm:ssZ');
		identifier = identifier.replace(/ /g,'_');
		alert.identifier = encodeURI(identifier);
		
		alert.sender = 'BPBD.JAKARTA.GOV.ID';
		alert.sent = moment.tz(feature.properties.last_updated, 'Asia/Jakarta').format('YYYY-MM-DDTHH:mm:ssZ');
		alert.status = "Actual";
		alert.msgType = "Alert";
		alert.scope = "Public";
		
		alert.info = self.createInfo( feature );
		// If info creation failed, don't create the alert
		if (!alert.info) {
			return;
		}
		
		return alert;
	},
	
	/**
	 * Create a CAP INFO object for GeoJSON feature.
	 * @see {@link http://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html#_Toc97699542|3.2.2 "info" Element and Sub-elements}
	 * @param {object} feature petajakarta.org GeoJSON feature
	 * @return {object} Object representing INFO node suitable for XML conversion by xmlbuilder
	 */
	createInfo: function( feature ) {
		var self = this;
			
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
		} else {
			self.logger.error("Cap: createInfo(): State " + feature.properties.state + " cannot be resolved to a severity");
			return;
		}
		info.severity = severity;

		info.certainty = "Observed";
		info.senderName = "JAKARTA EMERGENCY MANAGEMENT AGENCY";
		info.headline = "FLOOD WARNING";
		
		var descriptionTime = moment(feature.properties.last_updated).tz('Asia/Jakarta').format('HH:mm z');
		var descriptionArea = feature.properties.parent_name + ", " + feature.properties.level_name;
		info.description = "AT " + descriptionTime + " THE JAKARTA EMERGENCY MANAGEMENT AGENCY OBSERVED " + levelDescription + " IN " + descriptionArea + ".";

		info.web = "https://petajakarta.org/";

		info.area = self.createArea( feature );
		// If area creation failed, don't create the info
		if (!info.area) {
			return;
		}

		return info;
	},
	
	/**
	 * Create a CAP AREA object for GeoJSON feature.
	 * @see {@link http://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html#_Toc97699550|3.2.4 "area" Element and Sub-elements}
	 * @param {object} feature petajakarta.org GeoJSON feature
	 * @return {object} Object representing AREA node suitable for XML conversion by xmlbuilder
	 */
	createArea: function( feature ) {
		var self = this;
		
		var area = {};
		
		area.areaDesc = feature.properties.level_name + ", " + feature.properties.parent_name;
		
		// Collate array of polygon-describing strings from different geometry types
		area.polygon = [];
		var featurePolygons;
		if ( feature.geometry.type === "Polygon" ) {
			featurePolygons = [ feature.geometry.coordinates ];
		} else if ( feature.geometry.type === "MultiPolygon" ) {
			featurePolygons = feature.geometry.coordinates;
		} else {
			self.logger.error( "Cap: createInfo(): Geometry type '" + feature.geometry.type + "' not supported" );
			return;
		}
		
		// Construct CAP suitable polygon strings (whitespace-delimited WGS84 coordinate pairs - e.g. "lat,lon lat,lon")
		// See: http://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html#_Toc97699550 - polygon
		// See: http://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html#_Toc520973440
		self.logger.debug( "Cap: createInfo(): " + featurePolygons.length + " polygons detected for " + area.areaDesc );
		for (var polygonIndex=0; polygonIndex<featurePolygons.length; polygonIndex++) {
			// We assume all geometries to be simple Polygons with a single LineString (LinearRing)
			if ( featurePolygons[polygonIndex].length > 1 ) {
				self.logger.error( "Cap: createInfo(): Polygon with interior rings is not supported" );
				return;
			}
			
			var polygon = "";
			self.logger.debug( "Cap: createInfo(): " + featurePolygons[polygonIndex][0].length + " points detected in polygon " + polygonIndex );
			for (var pointIndex=0; pointIndex<featurePolygons[polygonIndex][0].length; pointIndex++) {
				var point = featurePolygons[polygonIndex][0][pointIndex];
				polygon += point[1] + "," + point[0] + " ";
			}
			
			area.polygon.push( polygon );
		}
		
		return area;
	}

};

// Export our object constructor method from the module
module.exports = Cap;