/**
 * Product Hunt action for LaunchBar.
 *
 * @author Walter Krivanek
 * @license Licensed under the GPL license
 * @see {@link https://www.producthunt.com/}
 */

/**
 * Object for better error handling.
 *
 * @param {Number} [code=Error.UNKNOWN] - The error code.
 * @param {string} [message] The error message. Intendet for users and logs.
 * @param {string} [description] Even further information.
 */
function Error(code, message, description) {
	this.code = code || Error.UNKNOWN;

	if (message == null) {
		switch (code) {
			default:
			case Error.UNKNOWN:
				this.message = 'Error occurred';
				break;

			case Error.TOKEN_INVALID:
				this.message = 'Invalid token';
				this.description = 'Please try again…';
				break;

			case Error.API_ERROR:
				this.message = 'Error occurred on API server';
				break;

			case Error.PARAMETER_MISSING:
				// Always override the message with more helpful information.
				this.message = 'A parameter is missing from function call';
				break;
		}
	} else {
		this.message = message;
		this.description = description;
	}

	return this;
}


/**
 * Logs the error to the system log.
 */
Error.prototype.log = function() {
	LaunchBar.log('Error ' + this.code + ': ' + this.message + (this.description != null ? ' (' + this.description + ')' : ''));
}

// Error codes.
Error.TOKEN_INVALID = 1;			// Invalid/revoked token.
Error.TOKEN_MISSING = 2;			// No token has been stored or committed.
Error.PARAMETER_MISSING = 3;		// A mandator parameter is missing.
Error.API_ERROR = 4;					// Error on API side.
Error.UNKNOWN = 666;					// Everything else.
