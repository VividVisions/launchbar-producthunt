/**
 * Product Hunt action for LaunchBar.
 *
 * @author Walter Krivanek
 * @license Licensed under the GPL license
 * @see {@link https://www.producthunt.com/}
 */

/**
 * Converts string representations of dates to human readable, relative dates e.g. '2 days ago').
 * Based on John Resig's JavaScript Pretty Date.
 *
 * @see {@link http://ejohn.org/blog/javascript-pretty-date/}
 */
var relativeDate = {

	/**
	 * Converts a date string to a relative date string.
	 *
	 * @param {string} dateString String representation of a date.
	 */
	make: function(dateString) {
		var date = new Date(dateString);
		var diff = (((new Date()).getTime() - date.getTime()) / 1000);
		var dayDiff = Math.floor(diff / 86400);

		if (isNaN(dayDiff) || dayDiff < 0) {
			return;
		}

		return dayDiff === 0 && (
				diff < 60 && 'Just now' ||
				diff < 120 && '1 minute ago' ||
				diff < 3600 && Math.floor( diff / 60 ) + ' minutes ago' ||
				diff < 7200 && '1 hour ago' ||
				diff < 86400 && Math.floor( diff / 3600 ) + ' hours ago'
			) ||
			dayDiff === 1 && 'Yesterday' ||
			dayDiff < 7 && dayDiff + ' days ago' ||
			dayDiff < 31 && Math.ceil( dayDiff / 7 ) + ' weeks ago' ||
			dayDiff >= 31 && '5+ weeks ago';
	},


	/**
	 * Creates a relative date string and localises it.
	 *
	 * @param {string} dateString String representation of a date.
	 * @see _localizePrettyDate
	 */
	makeLocalized: function(dateString) {
		return this._localizePrettyDate(this.make(dateString));
	},


	/**
	 * Quick'n'dirty solution to be able to use placeholders/variables in
	 * localised strings. E.g. '%d days ago' -> '2 days ago'
	 *
	 * @param {string} relativeDateString - The string of the relative date, e.g. '2 days ago'
	 * @returns {string} The localised string.
	 */
	_localizePrettyDate: function(relativeDateString) {
		// Do we have numbers in our string?
		var match = relativeDateString.match(/\d*/);
		if (match.length > 0) {
			// Yes. Replace it with the %d placeholder, localise the string and insert the number again.
			var num = match.shift();
			return relativeDateString.replace(/\d*/, '%d').localize().replace('%d', num);
		} else {
			// No. Just localise the string.
			return relativeDateString.localize();
		}
	}
};
