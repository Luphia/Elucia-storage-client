module.exports = function($, elucia, win) {
		var 

		init = function(_node, _data) {
			if (elucia.config.user.escrow)
				$('div#trusteeship', _node).hide();
			else
				$('div#cancel', _node).hide();

			$('div#trusteeship', _node).click(function() {
				var password = $('input[type=password]', _node).val();
				checkPassword(password, function(correct) {
					if (correct)
						trusteeship(password);
					else
						elucia.warning("Wrong Password");
				});			
			});

			$('div#cancel', _node).click(function() {
				var password = $('input[type=password]', _node).val();
				checkPassword(password, function(correct) {
					if (correct)
						deleteUserKey();
					else
						elucia.warning("Wrong Password");
				});
			});

			$('div#download', _node).click(function() {
				var password = $('input[type=password]', _node).val();
				checkPassword(password, function(correct) {
					if (correct) {
						win.window.location = "http://localhost:8888/savekey";
					}
					else
						elucia.warning("Wrong Password");
				});
			});
			return this;
		},

		checkPassword = function(_password, _callback) {
			var account = elucia.config.user.username;
			var request = {
				path: "checkPassword/"+account+'/'+_password,
				success: function(response) {
					if (response.result==1) {
						if (typeof response.data.clientId == "undefined") 
							_callback(false);
						else 
							_callback(true);		
					} else {
						_callback(false);
					}
				}
			};
			elucia.centerRest.get(request);
		},

		deleteUserKey = function() {
			var request = {
				path: "user/key",
				success: function(response) {
					if (response.result==1) {
						elucia.confirm("金鑰取消託管");
						$('div#cancel').hide();
						$('div#trusteeship').show();
						win.window.opener.reloadConfig();
					}
				}
			};
			elucia.centerRest.del(request);
		},

		destroy = function() {
			var fs = require('fs');
			fs.unlinkSync("./clown.jpg");
		},

		getKey = function(_callback) {
			var http = require('http'),
				fs   = require('fs'),
				writeStream = fs.createWriteStream("./clown.jpg");
			console.log("get key start");
			var request = {
				host: "localhost",
				port: 8888,
				path: "/savekey"
			};
			http.get(request, function(response) {
				response.pipe(writeStream);
				response.on('end', function() {
					console.log("get key done");
					_callback();
				});	
			});
		},

		getPartialKey = function(password) {
			var keyEscrow = require("../../modules/keyEscrow.js"),
				escrowKey = keyEscrow.getPartialKey("./clown.jpg", password);			
			destroy(); /* 刪除金鑰暫存檔 */
			return escrowKey;
		},

		postKey = function(escrowKey) {
			var request = {
				path: "user/key",
				data: {
					escrowKey: escrowKey
				},
				success: function(response) {
					if (response.result == 1) {
						console.log(response.message);
						elucia.confirm("金鑰託管成功");
						$('div#trusteeship').hide();
						$('div#cancel').show();
						win.window.opener.reloadConfig();
					} else {
						console.log(response.data.err);
						elucia.confirm(response.message);
					}
				}
			};
			console.log("escrow key start");
			elucia.centerRest.post(request);
		},

		trusteeship = function(password) {
			/* 金鑰託管流程 */
			/* 第一步：agent 取得金鑰 */
			/* 第二步：keyEscrow module 切割金鑰 */
			/* 第三步：post center 託管金鑰 */
			getKey(function() {
				var escrowKey = getPartialKey(password);
				console.log("get sub key");
				postKey(escrowKey);
			});
		},

		that = {
			init: init,
			destroy: destroy
		};

		return that;
};