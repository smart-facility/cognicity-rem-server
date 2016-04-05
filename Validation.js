'use strict';

/**
 * Validation routines used by our Express server to validate user input
 * @constructor
 */
var Validation = function(){};

Validation.prototype = {

	/**
	 * Validate a parameter which should be a number, optionally with min and max values.
	 * @param {number} param Parameter to validate
	 * @param {number=} min Minimum value parameter can have and be valid
	 * @param {number=} max Maximum value parameter can have and be valid
	 * @returns {boolean} True if the parameter passed validation
	 */
	validateNumberParameter: function(param, min, max) {
		var valid = true;
		if ( typeof param !== 'number' ) valid = false;
		if ( isNaN(param) ) valid = false;
		if ( min && param < min ) valid = false;
		if ( max && param > max ) valid = false;
		return valid;
	},

	/**
	 * Validate a parameter which should be an integer
	 * @param {number} param Parameter to validate
	 * @returns {boolean} True if the parameter passed validation
	 */
	validateIntegerParameter: function(param) {
		var valid = true;
		if ( typeof param !== 'number' ) valid = false;
		if ( isNaN(param) ) valid = false;
		if (param !== parseInt(param)) valid = false;
		return valid;
	},

	/**
	 * Validate a parameter which should be a boolean.
	 * @param {boolean} param Parameter to validate
	 * @returns {boolean} True if the parameter passed validation
	 */
	validateBooleanParameter: function(param) {
		var valid = true;
		if ( typeof param !== 'boolean' ) valid = false;
		return valid;
	},

	/**
	 * Validate a parameter which should be a string.
	 * @param {string} param Parameter to validate
	 * @param {boolean} emptyAllowed If true, an empty string is valid. Defaults to false.
	 * @returns {boolean} True if the parameter passed validation
	 */
	validateStringParameter: function(param, emptyAllowed) {
		if (emptyAllowed === undefined) emptyAllowed = false;

		var valid = true;
		if (typeof param !== 'string') valid = false;
		if (!emptyAllowed && param === "") valid = false;
		return valid;
	}

};

module.exports = new Validation();
