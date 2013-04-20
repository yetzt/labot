/*

 the brain of labot

 */
var fs = require('fs');
var google = require('google');
var twitter = require('./twitter');

exports.BRAINZZZ = function (filename) {
	var me = this;

	var settings = {
		allowBlabbers: false,  //say random things
		allowReact: false  //react on users state change
	};

	var mouth;

	var answers = {},
		blabbers = [];

	loadData();

	me.init = function (withMouth) {
		mouth = withMouth;
		speak('LA!');
		checkStartBlabber();
	};

	function randomblabber() {
		if (!settings.allowBlabbers)
			return;
		blabber();
		var _sec = parseInt(Math.random() * 3000000, 10);
		console.log(_sec, "bis frase");
		setTimeout(randomblabber, _sec);
	}

	function loadData() {
		console.log('loading brain food');
		fs.exists(filename, function (exists) {
			if (exists) {
				var data = JSON.parse(fs.readFileSync(filename, 'utf8'));
				answers = data['answers'];
				blabbers = data['blabbers'];
			} else {
				console.log('well, you need a data.json file, teh brain will stay silent!!1!');
			}
		});
	}

	function saveData() {
		console.log('saving brain food');
		var newdata = {"answers": answers, "blabbers": blabbers};
		fs.writeFile(filename, JSON.stringify(newdata, null, '\t'), function (err) {
			if (err) {
				console.log('error saving ' + filename + ' : ' + err);
			} else {
				console.log(filename + ' saved');
			}
		});
	}

	function speak(msg) {
		if (!mouth) {
			console.log('I have no mouth :.(');
		} else {
			mouth(msg);
		}
	}

	function checkStartBlabber() {
		if (settings.allowBlabbers)
			setTimeout(randomblabber, parseInt(Math.random() * 30000, 10));
	}

	function blabber() {
		var keys = Object.keys(blabbers);
		var some = (parseInt((Math.random() * 1000), 10) % keys.length);
		var key = keys[some];
		var list = blabbers[key];
		if ((list) && (list.length > 0)) {
			var _id = (parseInt((Math.random() * 1000), 10) % list.length);
			speak(list[_id]);
		}
	}

	me.react = function (from, type) {
		if (!settings.allowReact)
			return;
		var _letter = from.split(/\//).pop().substr(0, 1);
		var _msg = (type !== 'unavailable') ? "\\" + _letter + "/" : "/" + _letter + "\\";
		speak(_msg);
	};

	function learn(arr) {
		console.log(arr);
		if (arr.length <= 1) {
			speak('hübsch! aber was soll ich sagen?');
		} else {
			var key = arr[0];
			if (Object.keys(blabbers).indexOf(key) >= 0) {
				speak('sorry! das wort will ich nicht lernen, weil ichs schon kenne');
			} else {
				arr = arr.slice(1);
				answers[key] = arr.join(' ');
				saveData();
				speak('ok. notiert');
			}
		}
	}

	function forget(arr) {
		if (arr.length === 1) {
			speak('was soll ich vergessen?');
		} else {
			if (!answers[arr[1]]) {
				speak('das kannte ich eh nich. habs trotzdem vergessen.');
			} else {
				delete answers[arr[1]];
				saveData();
				speak('hab irgendwas vergessen.');
			}
		}
	}

	function recall() {
		var result = [];
		for (var k in answers) {
			result.push('"' + k + '"');
		}
		speak(result.join(','));
	}

	function search(arr) {
		google.pages = 1;
		google.resultsPerPage = 5;
		if ((arr.length > 0) && (!isNaN(arr[0]))) {
			google.resultsPerPage = parseInt(arr[0], 10);
			arr = arr.slice(1);
		}

		var withdesc = false;
		if ((arr.length > 0) && (arr[0] === '-desc')) {
			withdesc = true;
			arr = arr.slice(1);
		}

		var term = arr.join(' ');
		google(term, function (err, next, links) {
			if (err) console.error(err);
			var result = ['google sacht:'];
			for (var i = 0; i < links.length; ++i) {
				if (links[i].link) {
					//console.log(links[i]);
					result.push(
						links[i].title
							+ "\n" + links[i].link  //link.href is an alias for link.link
							+ ((withdesc &&
							(links[i].description)) ? "\n" + links[i].description : '')
					);
				}
			}
			speak(result.join("\n"));
//			if (nextCounter < 4) {
//				nextCounter += 1;
//				if (next) next();
//			}

		});
	}

	function tweet(text) {
		twitterer.post("http://api.twitter.com/1/statuses/update.json",
			TWITTER_TOKEN,
			TWITTER_SECRET,
			({'status': text}),
			"application/json",
			function (error, data, response2) {
				if (error) {
					console.log('Error: ' + JSON.stringify(error) + '\n');
					for (i in response2) {
						out = i + ' : ';
						try {
							out += response2[i];
						}
						catch (err) {
						}
						out += '\n';
						console.log(out);
					}
				}
				else {
					console.log('Twitter status updated.');
				}
			});
	}

	function info() {
		var result = [];
		result.push('!google [anzahl ergebnisse] [-desc] Suchtext');
		result.push('!twitter Text');
		result.push('!lerne trigger antwort - Automatische Antwort hinzufügen');
		result.push('!vergiss trigger - Automatische Antwort entfernen');
		result.push('!liste - Alle Automatische Antworten anzeigen');
		result.push('!brabbel - Zufällige Texte an-/ausschalten');
		result.push('!grüß - Linkshirne begrüßen an-/ausschalten');
		result.push('!entscheide - sagt ja oder nein');
		result.push('!was - diese Liste anzeigen');
//		result.push('!hau_ab_bot - Bot ausschalten');
		speak(result.join("\n"));
	}

	function tweet(arr) {
		if (twitter.canTweet()) {
			var txt = arr.join(' ').trim();
			if (txt.length = 0) {
				speak('schade, kein text :.( ')
			} else if (txt.length > 140) {
				speak('oh noez, mit ' + txt.length + ' zu lang zum twittern :.( ')
			} else {
				twitter.tweetIt(txt, function (err, data) {
					if (err) {
						speak('mist. konnte nicht tweeten: ' + err);
					} else {
						speak('ok. getwittert!');
					}
				})
			}
		}
	}

	function trigger(text) {
		for (var ka in answers) {
			var re = new RegExp(ka, "i");
			if (re.test(text)) {
				speak(answers[ka]);
			}
		}
		for (var kb in blabbers) {
			var re = new RegExp(kb, "i");
			if (re.test(text)) {
				var _id = (parseInt((Math.random() * 1000), 10) % blabbers[kb].length);
				speak(blabbers[kb][_id]);
			}
		}
	}

	function decide() {
		speak(Math.random() === 1 ? 'ja' : 'nein');
	}

	me.eat = function (text) {
		if ((!text) || (text.length == 0))
			return;
		if (text[0] === '!') {
			var arr = text.split(' ');
			var cmd = arr[0];
			arr = arr.slice(1);
			if (cmd === '!lerne') {
				learn(arr);
			} else if (cmd === '!vergiss') {
				forget(arr);
			} else if (cmd === '!liste') {
				recall();
			} else if (cmd === '!google') {
				search(arr);
			} else if (cmd === '!entscheide') {
				decide();
			} else if (cmd === '!brabbel') {
				settings.allowBlabbers = !settings.allowBlabbers;
				checkStartBlabber();
				speak('brabbeln ist jetzt ' + (settings.allowBlabbers ? 'an' : 'aus'));
			} else if (cmd === '!grüß') {
				settings.allowReact = !settings.allowReact;
				speak('grüßen ist jetzt ' + (settings.allowBlabbers ? 'an' : 'aus'));
			} else if (cmd === '!was') {
				info();
			} else if (cmd === '!twitter') {
				tweet(arr);
			}
		} else {
			trigger(text);
		}
	};

	return me;
};
