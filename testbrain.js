var express = require('express');
var app = express();
var path = require('path');
var config = require(path.resolve(__dirname, "config.js"));
var brain = require(path.resolve(__dirname, "labrain.js")).BRAINZZZ(config.datafile);


// configure express
app.configure(function () {
	//app.use(express.logger());
	app.use(express.bodyParser());
});

app.get('/', function (req, res) {
	res.sendfile('testbrain.html');
});

app.post('/', function (req, res) {
	var body = brain.eat(req.body.text || '') || '[eingabe wird ignoriert]';
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Content-Length', body.length);
	res.end(body);
});

app.listen(3000);
console.log('Listening on port 3000');