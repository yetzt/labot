#!/usr/bin/env node
/**
	labot.js – an xmpp bot
**/

var fs = require('fs');
var path = require('path');
var xmpp = require('node-xmpp');
var xml2js = require('xml2js');
var config = require(path.resolve(__dirname, "config.js"));
var parser = new xml2js.Parser();
var brain = require(path.resolve(__dirname, "labrain.js")).BRAINZZZ(config.datafile);

var chat = new xmpp.Client({
	jid: config.username, 
	password: config.password
});

var saidLa = false;

chat.on('online', function() {
	console.log('online');
	// c('status').t('zombi online')
	chat.send(
		new xmpp.Element('presence', {
			type: 'available'
		}).c('show').t('chat').up().c('status').t('ohai')
	);
	chat.send(
		new xmpp.Element('presence', {
			to: "" + config.room + "@" + config.conference + "/" + config.nickname
		}).c('x', {
			xmlns: 'http://jabber.org/protocol/muc'
		})
	);
});  

chat.on('stanza', function(stanza) {
	if (stanza.is('message') && stanza.attrs.type === 'groupchat' && !fromMe(stanza)) {
		stanza.children.forEach(function(_item){
			if (_item.name === 'body') {
				var _txt = _item.children[0];
				var answer = brain.eat(_txt);
				if (answer)
					sendmsg(answer);
			}
		});
	} else if (stanza.is('presence')) {
		if (fromMe(stanza)) {
			if (saidLa) return;
			// say LA!
			sendmsg("LA!")
			saidLa = true;
			//setTimeout(start, parseInt(Math.random()*30000,10));
			//setTimeout(meeble, parseInt(Math.random()*300000,10));
		} else {
			// say hello!
			var _letter = stanza.attrs.from.split(/\//).pop().substr(0,1);
			var _msg = (stanza.attrs.type !== 'unavailable') ? "\\"+_letter+"/" : "/"+_letter+"\\";
			sendmsg(_msg);
		}
	}
});

chat.on('error', function(e) {
	console.log(e);
});

var start = function() {
	var _id = (parseInt((Math.random() * 1000), 10) % config.phrases.length);
	sendmsg(config.phrases[_id]);
	var _sec = parseInt(Math.random()*3000000,10);
	console.log(_sec, "bis frase");
	setTimeout(start, _sec);
}

var meeble = function() {
	var _id = (parseInt((Math.random() * 1000), 10) % config.meeble.length);
	sendmsg(config.meeble[_id]);
	var _sec = parseInt(Math.random()*3000000,10);
	console.log(_sec, "bis frase");
	setTimeout(meeble, _sec);
}

/* helpers */
var fromMe = function(stanza) {
	return (stanza.attrs.from === (config.room+"@"+config.conference+"/"+config.nickname) || stanza.attrs.from.split(/\//).shift() === config.username);
};

var sendmsg = function(msg) {
	chat.send(new xmpp.Element('message',{
		to: config.room+"@"+config.conference,
		type: 'groupchat'
	}).c('body').t(msg));
}