module.exports = function($, elucia, win) {
		var 

		init = function(_node, _data) {
			this.node = _node;
			this.data = _data;

			var currGenKey = $.proxy(this, "genKey");
			var currGetKey = $.proxy(this, "getKey");
			var currInitEvent = $.proxy(this, "initEvent");

			currGenKey(function() {
				currGetKey(currInitEvent);
			});



			return this;
		},

		initEvent = function() {
			var currEscrowKey = $.proxy(this, "escrowKey");
			$("div.choose > div:nth-child(1)", this.node).click(function() {
				currEscrowKey();
				console.log("click");
			});

			$("div.choose > div:nth-child(2)", this.node).click(function() {
				win.window.location = "http://localhost:8888/savekey";
			});
		},

		genKey = function(_callback) {
			// jquery 不支援 get body data 故改用 nodejs lib
			var rest = new require("../../modules/restRequest.js")();
			rest.get({
				"host": elucia.config.agent.host,
				"port": elucia.config.agent.port,
				"path": "/genkey",
				"data": {"key_type": "AES-256"},
				"callBack": {
					success: function() {
						_callback();
						elucia.configOBJ.set("localKey", true);
						elucia.configOBJ.update();
					},
					fail: function(e) {
						console.log("gen key Error!!");
						console.log(e);
					}
				}
			});
			/*
			elucia.agentRest.get({
				"path": "genkey",
				"data": {"key_type": "AES-256"},
				"dataType": "json",
				success: function(_d) {
					_callback();
					elucia.configOBJ.set("localKey", true);
					elucia.configOBJ.update();
				}
			});
			*/

			elucia.agentRest.post({
				"path": "encrypt_setting",
				"data": {"encrypt": true},
				success: function() {}
			});

			elucia.centerRest.post({
				"path": "user/genkey",
				success: function() {
					console.log("client genKey");
				}
			});
		},

		getKey = function(_callback) {
			var http = require("http"),
				fs   = require("fs"),
				stream = fs.createWriteStream("./clown.jpg");

			http.get(
				{ 
					host: "localhost",
					port: 8888,
					path: "/savekey"
				},
				function(res) {
					res.pipe(stream);
					_callback && _callback();
				}
			);
		},

		escrowKey = function() {
			console.log(this.data);
			var escrowKey = require("../../modules/keyEscrow.js");
			elucia.centerRest.post({
				"path": "user/key",
				"data": {"escrowKey": escrowKey.getPartialKey("./clown.jpg", this.data.password)},
				success: function(_data) {
					elucia.configOBJ.set("localKey", true);
					elucia.configOBJ.update();
					win.window.opener.reloadConfig();
				}
			});
		},

		destroy = function() {
			fs.unlinkSync("./clown.jpg");
		},

		that = {
			init: init,
			initEvent: initEvent,
			escrowKey: escrowKey,
			genKey: genKey,
			getKey: getKey,
			destroy: destroy
		};

		return that;
};