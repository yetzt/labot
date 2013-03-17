/*

 the brain of labot

 */
var fs = require('fs');

exports.BRAINZZZ = function (filename) {
	var me = this;

	var answers = {},
		blabbers = [];

	loadData();

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

	me.eat = function (text) {
		if ((!text) || (text.length == 0))
			return null;
		if (text[0] === '!') {
			var arr = text.split(' ');
			var cmd = arr[0];
			if (cmd === '!lerne') {
				arr = arr.slice(1);
				console.log(arr);
				if (arr.length <= 1) {
					return 'hübsch! aber was soll ich sagen?'
				} else {
					var key = arr[0];
					arr = arr.slice(1);
					answers[key] = arr.join(' ');
					saveData();
					return 'ok. notiert';
				}
			} else if (cmd === '!vergiss') {
				if (arr.length === 1) {
					return 'was soll ich vergessen?'
				} else {
					if (!answers[arr[1]]) {
						return 'das kannte ich eh nich. habs trotzdem vergessen.'
					} else {
						delete answers[arr[1]];
						saveData();
						return 'hab irgendwas vergessen.'
					}
				}
			} else if (cmd === '!liste') {
				var result = [];
				for (var k in answers) {
					result.push('"' + k + '"');
				}
				return result.join(',');
			} else {
				return null;
			}
		}

		for (var ka in answers) {
			var re = new RegExp(ka, "i");
			if (re.test(text)) {
				return answers[ka];
			}
		}
		for (var kb in blabbers) {
			var re = new RegExp(kb, "i");
			if (re.test(text)) {
				var _id = (parseInt((Math.random() * 1000), 10) % blabbers[kb].length);
				return blabbers[kb][_id];
			}
		}
		return null;
	};

	return me;
};
