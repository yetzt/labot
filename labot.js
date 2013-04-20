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

chat.on('online', function () {
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

chat.on('stanza', function (stanza) {
	if (stanza.is('message') && stanza.attrs.type === 'groupchat' && !fromMe(stanza)) {
		if (!isBacklog(stanza)) {
			stanza.children.forEach(function (_item) {
				if (_item.name === 'body') {
					var _txt = '';
					_item.children.forEach(function (t) {
						_txt += t;
					});
					if (_txt === "!hau_ab_bot") {
						logout();
					} else {
						brain.eat(_txt);
					}
				}
			});
		} else {
			console.log('backlog ignored');
		}
	} else if (stanza.is('presence')) {
		if (fromMe(stanza)) {
			if (saidLa) return;
			brain.init(sendmsg);
			saidLa = true;
		} else {
			console.log(stanza);
			brain.react(stanza.attrs.from, stanza.attrs.type);
		}
	}
});

chat.on('error', function (e) {
	console.log(e);
});

/* helpers */
var fromMe = function (stanza) {
	return (stanza.attrs.from === (config.room + "@" + config.conference + "/" + config.nickname) || stanza.attrs.from.split(/\//).shift() === config.username);
};
var isBacklog = function (stanza) {
	// test on presence of items with "name: delay"
	// backlog is sent with http://xmpp.org/protocols/urn_xmpp_delay/
	if (stanza.children.length > 1) {  //delay should never come alone
		for (var i = 0; i < stanza.children.length; i++) {
			if (stanza.children[i].name === 'delay') {
				return true;
			}
		}
	}
	return false;
};

var sendmsg = function (msg) {
	if (!msg)
		return;
	chat.send(new xmpp.Element('message', {
		to: config.room + "@" + config.conference,
		type: 'groupchat'
	}).c('body').t(msg));
}

var logout = function () {
	var stanza = new xmpp.Element('presence',
		{from: config.username, type: 'unavailable'});
	chat.send(stanza);
	setTimeout(function () {
		chat.end();
	}, 10);
};

process.on('SIGINT', function () {
	console.log("\ngracefully shutting down from SIGINT")
	logout();
	setTimeout(function () {
		process.exit();
	}, 10);
});

