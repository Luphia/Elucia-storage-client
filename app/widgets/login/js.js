module.exports = function($, elucia, win) {
		var init = function(_node, _data) {
			this.data = _data;

			var currLogin = $.proxy(this, "login");
			$("#login", _node).click( function() {
				var data = {
					"username": $("input.user", _node).val(),
					"password": $("input.password", _node).val()
				};
				currLogin(data);
			});
		
			_node.keydown( function(event) {
				if(event.keyCode == 13) {
					var account = $("input.user", _node).val();
					var password = $("input.password", _node).val();
					
					if(account.trim() == "") {
						$("input.user", _node).focus();
					} else if(password.trim() == "") {
						$("input.password", _node).focus();
					} else {			
						$("button#login", _node).click();
					}
				}
			});

			$("input.user", _node).focus();
			this.checkLogin();
			return this;
		},
		login = function(_data) {
			var that = this;
			var currAgentLogin = $.proxy(this, "agentLogin");
			var currGenerateCenterRest = $.proxy(this, "generateCenterRest");
			var currGenerateAgentRest = $.proxy(this, "generateAgentRest");

			$("div.login input", this.node).attr("disabled", "disabled");
			$("div.login button", this.node).attr("disabled", "disabled");
			$("div.login span.message", this.node).removeClass("alert").text("checking...");

			var data = {
				url: this.data.paths.login,
				data: _data,
				success: function(__data) {
					if(__data.result == 1) {

						//agent login
						var loginData = {
							"center_url":"http://"+elucia.config.server.host+":"+elucia.config.server.port+"/",
							"username":$("input.user", this.node).val(),
							"password":$("input.password", this.node).val()
						};
						currAgentLogin(loginData);

						var afterData = {
							"password": loginData.password
						}
						for(var key in __data.data) {
							afterData[key] = __data.data[key];
						}

						that.hide();
						$("input.password", this.node).val("");
						that.data.afterLogin(afterData);

						elucia.centerRest = currGenerateCenterRest(__data.data);
						elucia.agentRest = currGenerateAgentRest(__data.data);
					}
					else {
						that.alert(_data.message);
						$("input.password", that.node).focus();
					}

					$("div.login input", this.node).removeAttr("disabled");
					$("div.login button", this.node).removeAttr("disabled");
				}
			};
			elucia.rest.post(data);

		},

		agentLogin = function(_data)
		{
			/*
			var rest = new require("../../modules/restRequest.js")();
			var detail = {
				"host": elucia.config.agent.host,
				"port": elucia.config.agent.port,
				"path": "/basic_setting",
				"data": _data,
				"callBack": {
					success: function(__data) {
						if(__data.result == 1) 
						{
							console.log("agent login ok");
						}
						else 
						{
							console.log("agent login error");
							console.log(__data);
							console.log(__data.result);
						}
					},
					fail: function(e) {
						console.log("agent login error");
						console.log(e);
					}
				}
			};
			rest.post(detail);
			console.log(detail);
			*/


			var data = {
				url: "http://"+elucia.config.agent.host+":"+elucia.config.agent.port+"/basic_setting",
				data: _data,
				success: function(_data) {
					console.log(_data);
					if(_data.result == 1) 
					{
						console.log("agent login ok");
					}
					else 
					{
						console.log("agent login error");
					}
				}
			};
			elucia.rest.post(data);

		},

		generateCenterRest = function(_data) {

			var beforeSend = function(xhr) {
				xhr.setRequestHeader('Authorization', _data.type + ' ' + _data.token);
			};
			var centerUrl = "http://" + elucia.config.server.host + ":" + elucia.config.server.port + "/";
			var centerRest = {
				get: function(__data) {
					__data.url = centerUrl + __data.path;
					__data.beforeSend = beforeSend;
					elucia.rest.get(__data);
				},
				post: function(__data) {
					__data.url = centerUrl + __data.path;
					__data.beforeSend = beforeSend;
					elucia.rest.post(__data);
				},
				put: function(__data) {
					__data.url = centerUrl + __data.path;
					__data.beforeSend = beforeSend;
					elucia.rest.put(__data);
				},
				del: function(__data) {
					__data.url = centerUrl + __data.path;
					__data.beforeSend = beforeSend;
					elucia.rest.del(__data);
				}
			};

			return centerRest;
		},

		generateAgentRest = function(_data) {
			var agentUrl = "http://" + elucia.config.agent.host + ":" + elucia.config.agent.port + "/";
			var agentRest = {
				get: function(__data) {
					__data.url = agentUrl + __data.path;
					elucia.rest.get(__data);
				},
				post: function(__data) {
					__data.url = agentUrl + __data.path;
					elucia.rest.post(__data);
				},
				put: function(__data) {
					__data.url = agentUrl + __data.path;
					elucia.rest.put(__data);
				},
				del: function(__data) {
					__data.url = agentUrl + __data.path;
					elucia.rest.del(__data);
				}
			};

			return agentRest;
		},

		logout = function() {
			var that = this;
			var data = {
				url: this.data.paths.login,
				data: {},
				success: function(_data) {
					that.show();
					that.data.afterLogout();
				}
			};

			elucia.rest.del(data);
		},
		checkLogin = function() {
			var configModule = require("../../modules/config");
			this.config = configModule.checkConfig();

			this.data.paths = {
				"login": "http://" + this.config.get("server:host") + ":" + this.config.get("server:port") + this.config.get("paths:login")
			};
		},
		show = function() {
			$("div.login", this.node).animate({"margin-top": "-100"}, 300);
		},
		hide = function() {
			$("div.login", this.node).animate({"margin-top": "-100%"}, 300);
		},
		alert = function(_data) {
			$("div.login span.message", this.node).addClass("alert").text(_data);
			$("div.login", this.node).animate({"margin-left": "-=10"}, 100, function() {
				$("div.login", this.node).animate({"margin-left": "+=20"}, 100, function() {
					$("div.login", this.node).animate({"margin-left": "-=20"}, 100, function() {
						$("div.login", this.node).animate({"margin-left": "+=20"}, 100, function() {
							$("div.login", this.node).animate({"margin-left": "-=20"}, 100, function() {
								$("div.login", this.node).animate({"margin-left": "+=10"}, 100);
							})
						})
					})
				})
			});
		},
		destroy = function() {

		},

		that = {
			init: init,
			login: login,
			agentLogin: agentLogin,
			generateCenterRest: generateCenterRest,
			generateAgentRest: generateAgentRest,
			logout: logout,
			checkLogin: checkLogin,
			hide: hide,
			show: show,
			alert: alert,
			destroy: destroy
		};

		return that;
};