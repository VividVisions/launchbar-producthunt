/**
 * Product Hunt action for LaunchBar.
 *
 * @author Walter Krivanek
 * @license Licensed under the GPL license
 * @see {@link https://www.producthunt.com/}
 */

include('Product Hunt API.js');
include('RelativeDate.js');

/**
 * This function is called when the user selects the Product Hunt action in the LaunchBar.
 *
 * @returns {Array} An array of list items to show in the LaunchBar.
 */
function run() {
	// Check for a token.
	if (PH_API.getToken() === null) {

		LaunchBar.openURL('https://www.producthunt.com/v1/oauth/applications');
		var button = LaunchBar.alert('Token missing'.localize(), 'Please create a Developer Token and copy it to the clipboard.'.localize(), 'Okay, copied'.localize(), 'Cancel'.localize());

		switch (button) {
			// Copied
			case 0:
				var token = LaunchBar.getClipboardString();

				if (PH_API.testToken(token) === true) {
					PH_API.setToken(token);
					LaunchBar.displayNotification({
						title: 'Product Hunt',
						string: 'Token has been successfully saved. Loading products…'.localize()
					});
				} else {
					return [
						{
							title : 'Invalid token'.localize(),
							icon: 'caution.icns',
						},
						{
							title: 'Please try again…'.localize()
						}
					];
				}
				break;

			// Cancel
			case 1:
			default:
				return [{
					title : 'Token missing'.localize(),
					icon: 'caution.icns',
					url: 'https://www.producthunt.com/v1/oauth/applications'
				}];
				break;
		}
	}

	// We should have a valid token, so let's fetch some products.
	try {
		var returnItems = [{
			title: 'Today'.localize(),
			icon: 'time.png'
		}];

		// Get all posts from today.
		var result = PH_API.getPosts();
		result.posts.forEach(function(post) {
			returnItems.push(createLBItemFrom(post));
		});

		returnItems.push({
			title: 'Yesterday'.localize(),
			icon: 'time.png'
		});

		// Get all posts from yesterday.
		result = PH_API.getPosts(1);
		result.posts.forEach(function(post) {
			returnItems.push(createLBItemFrom(post));
		});

		return returnItems;

	} catch (e) {
		// Apparently, our token has been revoked.
		if (e.code === Error.TOKEN_INVALID) {
			// Delete stored token so we can ask the user to add a new one.
			delete Action.preferences.token;

			return [
				{
					title : 'Invalid token'.localize(),
					icon: 'caution.icns'
				},
				{
					title: 'Please try again…'.localize(),
					action: 'run'
				}
			];
		}

		// This this one of our Error objects, log it.
		if (typeof e.log == 'function') {
			e.log();
		}

		return [{
			title: 'Error occurred'.localize(),
			icon: 'caution.icns',
			subtitle: e.message
		}];
	}
}


/**
 * This function is called by LaunchBar when the user selects a product title
 * from the list.
 *
 * @param {Object} item The LaunchBar product item including the product details.
 */
function getProductDetails(item) {
	if (item === null || typeof item.phPost == 'undefined') {
		throw new Error(Error.API_ERROR);
	}

	var post = item.phPost;

	return [
		{
			title: post.name,
			subtitle: post.tagline,
			icon: 'logo.png',
			url: post.redirect_url
		},
		{
			title: '' + post.votes_count,
			subtitle: 'upvotes'.localize(),
			icon: 'upvotes.png',
			url: post.discussion_url
		},
		{
			title: '' + post.comments_count,
			subtitle: 'comments'.localize(),
			icon: 'comments.png',
			url: post.discussion_url
		},
		{
			title: post.user.name,
			subtitle: 'Posted by'.localize(),
			icon: 'user.png',
			url: post.user.profile_url
		},
		{
			title: relativeDate.makeLocalized(post.created_at),
			subtitle: 'Created'.localize(),
			icon: 'time.png',
			url: post.discussion_url
		}
	];
}

/**
 * Helper function to create a LaunchBar item from a Product Hunt post.
 *
 * @param {Object} post - A Product Hunt post.
 * @returns {Object} A LaunchBar item.
 */
function createLBItemFrom(post) {
	if (post === null) {
		return null;
	}

	return {
		title: post.name,
		subtitle: post.tagline,
		url: post.discussion_url,
		icon: 'logo.png',
		action: 'getProductDetails',
		actionReturnsItems: true,
		phPost: post
	};
}
