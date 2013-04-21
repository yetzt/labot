var OAuth = require('oauth').OAuth;
var config = require('./config');

var tweeter = new OAuth(
	"https://api.twitter.com/oauth/request_token", //requestUrl
	"https://api.twitter.com/oauth/access_token",  //accessUrl
	config.twitter.consumerKey,                    //consumerKey
	config.twitter.consumerSecret,                 //consumerSecret
	"1.0",                                         //version
	null,                                          //authorize_callback
	"HMAC-SHA1",                                   //signatureMethod
	null,                                          //nonceSize
	{"Accept": "*/*", "Connection": "close",
		"User-Agent": 'labot'}           //customHeaders
);

exports.canTweet = function () {
	return (config.twitter.consumerKey) &&
		(config.twitter.consumerSecret) &&
		(config.twitter.token) &&
		(config.twitter.secret);
};

exports.tweetIt = function (text, cb) {
	var body =
	{'status': text
		//,	'lat': consts.GPS_Latitude
		//,	'long': consts.GPS_Longitude
		//,	'place_id': consts.GEO_PlaceID
		//,	'display_coordinates': true
	};
	tweeter.post("http://api.twitter.com/1.1/statuses/update.json",  //url
		config.twitter.token,   //oauth_token
		config.twitter.secret, //oauth_token_secret
		body,                                                        //post_body
		"application/json",                                          //post_content_type
		function (error, data) { //}, response2) {
			if (error) {
				console.log('Error: Something is wrong.\n' + JSON.stringify(error));
				cb(JSON.stringify(error));
			} else {
				cb(null, data);
			}
		});
};
