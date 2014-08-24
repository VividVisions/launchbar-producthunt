/**
 * Product Hunt action for LaunchBar.
 *
 * @author Walter Krivanek
 * @license Licensed under the GPL license
 * @see {@link https://www.producthunt.com/}
 */

include('Error.js');

/**
 * A somewhat rudimentary container for the Product Hunt API.
 *
 * @author Walter Krivanek
 * @see {@link https://www.producthunt.com/v1/docs}
 */
var PH_API = {

	_url: 'https://api.producthunt.com/v1/',
	_token: Action.preferences.token || null,


	/**
	 * Returns the token.
	 *
	 * @returns {string} The token.
	 */
	getToken: function() {
		return this._token;
	},


	/**
	 * Stores the token in the action's preferences.
	 *
	 * @param {string} token - The new token.
	 */
	setToken: function(token) {
		this._token = Action.preferences.token = token;
	},


	/**
	 * Calls the API just to see if the token is valid.
	 *
	 * @todo Add better error handling. The call can fail for a number of reasons but we always assume the token is invalid.
	 * @param {string} token The token.
	 * @returns {Boolean} True, if the token is valid. False, if it's invalid (or missing).
	 */
	testToken: function(token) {
		if (token === null || token === '') {
			return false;
		}

		try {
			this._callAPI('me', 'GET', token);
		} catch (ignore) {
			return false;
		}

		return true;
	},


	/**
	 * Returns the product list as received from the API.
	 *
	 * @param {Number} [daysAgo] Get the products from this many days ago.
	 * @returns {Object} The data from the API.
	 * @see {@link https://www.producthunt.com/v1/docs/|Product Hunt API}
	 */
	getPosts: function(daysAgo) {
		return this._callAPI('posts' + (daysAgo != null  ? '?days_ago=' + daysAgo : ''));
	},


	/**
	 * Here's where the actual API call is made.
	 *
	 * @param {string} path - The path of the API call.
	 * @param {string} [method=GET] The method of the request (GET, POST, …).
	 * @param {string} [token] The authorization token. If omitted, the stored token is used.
	 * @see {@link https://www.producthunt.com/v1/docs/|Product Hunt API}
	 */
	_callAPI: function(path, method, token) {
		var token = token || this.getToken();

		// Make sure we have everything we need.
		if (token === null) {
			throw new Error(Error.TOKEN_MISSING)
		} else if (path === null || path === '') {
			throw new Error(Error.PARAMETER_MISSING, 'Product Hunt API: Path is missing.');
		} else if (method === null) {
			method = 'GET';
		}

		try {
			// Call the API.
			var result = HTTP.loadRequest(this._url + path, {
				method: method,
				headerFields: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + token
				},
				resultType: 'json'
			});
		} catch (e) {
			throw new Error(Error.UNKNOWN, e);
		}

		if (typeof result.response == 'undefined' || typeof result.repsone.staus == 'undefined') {
			// Something went wrong. Most likely on the API side.
			throw new Error(Error.API_ERROR, result.error, rsult.error_description);
		} else if (result.response.status === 200) {
			// Everything's OK.
			return result.data;
		} else if (result.response.status === 401) {
			// The token is invalid. May it has been revoked?
			throw new Error(Error.TOKEN_INVALID);
		} else {
			// For every other status code, we throw a general error.
			throw new Error(Error.API_ERROR, result.error, rsult.error_description);
		}
	}
};
