var openWindows = [];
var focusChildren = [];
var elucia = (function() {

var exist = function(_url) {
	try {
		var http = new XMLHttpRequest();
		http.open('HEAD', _url, false);
		http.send();
	
		return http.status != 404;
	} catch(e) {
		return false;
	}
}

,	isArray = function(input) {
	return input instanceof Array || input instanceof Object;
}

,	getData = function(_key, _arr) {
	tmpkey = _key.split(".");
	if(tmpkey.length > 1) {
		if(typeof(_arr[tmpkey[0]]) == "undefined") {
			return null;
		}
		var newkey = tmpkey.slice(1).join(".");

		return getData(newkey, _arr[tmpkey[0]]);
	}
	else if(tmpkey[0] == "") {
		return _arr;
	}
	else {
		if(typeof(_arr[tmpkey[0]]) == "undefined") {
			return null;
		}
		else {
			return _arr[tmpkey[0]];
		}
	}
}

,	translate = function(_data) {
	var reg=/\%\{[^\{\}]+\}/g;
	_data = _data.replace(reg, function(word) {
		var myKey = word.substr(2, (word.length - 3));
		// return i18n._(myKey);
		return ('<span class="translate" word="' + myKey + '">' + i18n._(myKey) + '</span>');
	});

	return _data;
}

,	displayByte = function(myByte, _initialUnit, _targetUnit) {
	// 2013.10.31新增功能
  // 可以傳入文字或數字型態參數
  // 指定初始容量單位與目標容量單位
  var ua = ["Byte", "KB", "MB", "GB", "TB", "EB", "ZB", "YB"],
      unit = 0;
  
	// 判斷初始容量單位
  if(typeof(_initialUnit) == 'undefined')
		unit = 0;
  else if( typeof(_initialUnit) === 'string' ) {
    // 將文字容量單位轉為數字容量單位
    for(var key in ua) {
      if(ua[key] == _initialUnit)
        unit = key;
    }
  }
  else if( _initialUnit < 0 || _initialUnit > 7 )
    unit = 0; // 若數字容量單位過小或過大，則預設為Byte
  else 
    unit = _initialUnit;
  
  // 判斷目標容量單位
  if( typeof(_targetUnit) === "undefined" ) {
    _targetUnit = 7; // 若未傳入參數，則目標容量單位為YB
  }
  if( typeof(_targetUnit) === 'string' ) {
    var isInt = false;
    for(var key in ua) {
      if(ua[key] == _targetUnit) {
        _targetUnit = key;
        isInt = true;
      }        
    }
    if( !isInt )
      _targetUnit = 7; // 若目標容量單位無法判斷，則預設為YB
  }
	
	if(elucia.isArray(myByte)) {
		while(true) {
			tmpcheck = false;
			for(var key in myByte) {
				if(myByte[key] >= 10000) {
					tmpcheck = true;
				}
			}

			if(tmpcheck) {
				for(var key in myByte) {
					myByte[key] = Math.round(myByte[key] / 1024);
				}
				unit++;
			}
			else {
				break;
			}
		}
	}
	else {
		while( unit < _targetUnit && myByte > 1024 ) {
      myByte = Math.round(myByte / 1024 * 100) / 100;
			unit ++;
		}
	}

	var data = [myByte, ua[unit], data = myByte + " " + ua[unit]];
	return data;
}

,	msg = function(_message, _option) {
	if(typeof(_option) != "undefined") {
		if(typeof(_option.container) != "undefined") {}
		if(typeof(_option.keep) != "undefined") {}
		if(typeof(_option.container) != "undefined") {}
	}

	var keeptime = 5000,
		container = $(".messageContainer"),
		tmpmsg = $('<div class="message"></message>'),
		pointer = $('<div class="pointer"></div>'),
		body = $('<div class="body"></div>').text(_message);

	if(container.length == 0) {
		container = $('<div class="elucia messageContainer"></div>').appendTo("body");
	}

	tmpmsg.append(pointer).append(body).appendTo(container);
	setInterval(function() {
		tmpmsg.slideUp(300, function() {
			tmpmsg.remove();
		});

	}, keeptime);
}

,	confirm = function(_message, _callback, _data) {
	if(typeof(_data) == "undefined") {
		_data = {};
	}
	_data["message"] = _message;
	_data["callback"] = _callback;
	var tmpWidget = {
		name: "confirmBox",
		data: _data
	};
	addWidget(tmpWidget, function(_node) {
		
	});
}

,	warning = function(_message, _callback) {
	var data = {
		message: _message,
		callback: _callback
	};
	var tmpWidget = {
		name: "warningBox",
		data: data
	};
	addWidget(tmpWidget, function(_node) {
		
	});
}

,	addTemplate = function(_file, _callback) {
	var fileUrl = "./widgets/" + _file + "/template.tmpl",
		tmplID = _file + "_tmpl";
		scriptTag = document.getElementById(tmplID);

	if(scriptTag) {
		_callback && _callback();
		return false;
	}

	if(!exist(fileUrl)) {
		_callback && _callback();
		return false;
	}

	$.ajax({
		type: "GET",
		url: fileUrl
	}).done(function( _data ) {
		if(typeof(_data) == "object") {
			_data = new XMLSerializer().serializeToString(_data);
		}

		_data = translate(_data);

		var oScript= document.createElement("script");
		oScript.id = tmplID;
		oScript.type = "text/x-jquery-tmpl";
		oScript.innerHTML = _data;

		var oHead = document.getElementsByTagName('HEAD').item(0);
		oHead.appendChild(oScript);
		_callback && _callback();
	});
}

,	loadTemplate = function(_file, _tmpl) {
	var fileUrl;

	if(typeof(_file) == "undefined") {
		return false;
	}
	else if(typeof(_file) == "object" && typeof(_file.widget) == "string" && typeof(_file.tmpl) == "string") {
		fileUrl = "./widgets/" + _file.widget + "/" + _file.tmpl + ".tmpl";
	}
	else {
		fileUrl = "./widgets/" + _file + "/template.tmpl";
	}

	if(!exist(fileUrl)) {
		return false;
	}

	$.ajax({
		type: "GET",
		url: fileUrl,
		async: false
	}).done(function( _data ) {
		if(typeof(_data) == "object") {
			_data = new XMLSerializer().serializeToString(_data);
		}

		_data = translate(_data);

		_tmpl.template = $(_data);
	});

	return true;
}

/*
,	add = function(_file, _callback) {
	addWidgetTo(_file, $(".vbody"), _callback);
}
*/

,	addSpine = function(_file, _callback) {
	addSpineTo(_file, $("body"), _callback);
}

,	addSpineTo = function(_file, _target, _callback) {
	if(typeof(_file) == "string") {
		tmpName = _file.toString();
		_file = {
			name: tmpName,
			data: {}
		};
	}

	addTemplate(_file.name);

	var tmpCSS = "./widgets/" + _file.name + "/css.css",
		tmpController = "./widgets/" + _file.name + "/controller.js",
		tmpModel = "./widgets/" + _file.name + "/model.js";

	addCSS(tmpCSS);

	require(configuration, [tmpController, tmpModel], function(Controller, Model) {
		// var myData = new Model(_file.data);
		_file.model = Model;
    	var	myApp = new Controller(_file);

    	_target.append(myApp.el);
	});
}

,	checkWidgetWindow = function(_widget) {
	//	return $("div.elucia.window div.title:contains(" + _widget + ")").parent().parent();
	return [];
}

,	windowToTop = function(_node) {
	/*
	$("div").each(function() {
		// always use a radix when using parseInt
		var index_current = parseInt($(this).css("zIndex"), 10);
		if(index_current > highest_z) {
			highest_z = index_current;
		}
	});

	if($(_node).css("zIndex") < highest_z || highest_z == 5) {
		highest_z += 1
		_node.css("zIndex", highest_z);
	}
	*/

	$("div.elucia.window").removeClass("top");
	$("div.elucia.window").addClass("bottom");
	_node.removeClass("bottom");
	_node.addClass("top");
}

,	focusTo = function(_win) {
	/*
	$("body").addClass("lock");
	_win.focus();
	*/
	var me = focusChildren.push(_win) - 1;
	_win.focus();

	$("body").addClass("lock");
	return me;
}
,	focusMe = function() {
	$("body").removeClass("lock");
}
,	unFocus = function(_i) {
	for(var key in focusChildren) {
		if(focusChildren[key].win.routing_id == _i) {
			focusChildren.splice(key, 1);
		}
	}

	if(focusChildren.length == 0) {
		$("body").removeClass("lock");
		win.focus();
	}
}

,	openWidget = function(_widget) {
	var _page = "";
	var _base = "";
	if(typeof(_widget) == "string") {
		tmpName = _widget.toString();
		_widget = {
			name: tmpName,
			data: {}
		};
	}

	_base = btoa(JSON.stringify(_widget));
	_widget.name && (_page = _widget.name);

	var link = "./widget.html#"+ _base;
	var subWin = win.window.open(link);
	subWin.onready = function() {
		this.elucia.config = elucia.config;
		this.elucia.configOBJ = elucia.configOBJ;
		this.elucia.centerRest = elucia.centerRest;
		this.elucia.agentRest = elucia.agentRest;
	};

	focusTo(subWin);
}

,	addWidget = function(_file, _callback) {
	addWidgetTo(_file, $("body"), _callback);
}

/*
,	addTo = function(_file, _target, _callback) {
	addCSS(_file);

	var tmpurl = "./html/" + _file + ".txt";
	$.get(tmpurl, function(_html) {
		var node = $(_html).appendTo(_target);
		//console.log($(_html));
		
		_callback && _callback(node);
	});
}
*/

,	addWidgetTo = function(_file, _target, _callback) {
	if(typeof(_file) == "string") {
		tmpName = _file.toString();
		_file = {
			name: tmpName,
			data: {}
		};
	}

	addCSS("./widgets/" + _file.name + "/css.css");
	addTemplateTo(_file, _target, _callback);
}

,	addTemplateTo = function(_file, _target, _callback) {

	if(_file.tmpl) {
		var tmpurl = _file.name;
	}
	else {
		var tmpurl = "./widgets/" + _file.name + "/template.tmpl";
	}

	$.get(tmpurl, function(_html) {
		if(typeof(_html) == "object") {
			_html = new XMLSerializer().serializeToString(_html);
		}

		_html = translate(_html);

		var node = $(_html).appendTo(_target),
			tmpApp;

		// console.log(_file.name);
		var App = require("./widgets/" + _file.name + "/js.js");
		try {
			var data = {};
			if(App) {
				var obj = new App($, elucia, win);
				obj.init(node, _file.data);
				obj.name = _file.name;
					
				_callback && _callback(node, data, obj);
			}
		} 
		catch(e) {
			console.log("something wrong with: " + _file.name);
			throw e;
		}

	});

}

,	addCSS = function(_file, _callback) {
	var fileUrl = _file,
		scriptTag = document.getElementById(_file);

	if(scriptTag) {
		_callback && _callback();
		return false;
	}

	if(!exist(fileUrl)) {
		_callback && _callback();
		return false;
	}

	var oScript= document.createElement("link");
	oScript.id = _file;
	oScript.rel = "stylesheet";
	oScript.type = "text/css";
	oScript.href = fileUrl;
	oScript.charset = "utf-8";

	var oHead = document.getElementsByTagName('HEAD').item(0);
	oHead.appendChild(oScript);

	_callback && _callback();
}

,	addJS = function(_file, _callback) {
	if(exist(fileUrl)) {

	}
	_callback && _callback();
}

,	loadSpineWidget = function(_widget) {
	addTemplate(_widget);
	require(configuration, ["./widgets/" + _widget + "/js.js"], function(TaskApp) {
    	var myApp = new TaskApp();
    	$("body").append(myApp.el);
	});
}

,	serializeData = function(_obj) {
	var rtdata = {},
		tmpArr = _obj.serializeArray();

	for(var key in tmpArr) {
		rtdata[tmpArr[key]["name"]] = tmpArr[key]["value"];
	}

	return rtdata;
}

,   stringBytes = function(_string) {
	var char, 
		bytes = 0;
	for(var i=0; i <_string.length;i++){
	    char = _string.charCodeAt(i);
	    while( char > 0 ){
		    bytes++;
		    char = char >> 8;
	    }
	}
	return bytes;
}

,	rest = {
	get: function(_data) {
		_data.type = "GET";
		this.ajax(_data);
	},
	post: function(_data) {
		_data.type = "POST";
		this.ajax(_data);
	},
	put: function(_data) {
		_data.type = "PUT";
		this.ajax(_data);
	},
	del: function(_data) {
		_data.type = "DELETE";
		this.ajax(_data);
	},
	list: function(_data) {
		_data.type = "LIST";
		this.ajax(_data);
	},
	ajax: function(_data) {
		_data.dataType = "json";
		if(_data.data) {
			_data.data = JSON.stringify(_data.data);
			_data.contentType = "application/json; charset=UTF-8";

			//_data.beforeSend = function (xhr) {
				/* 因 HTTP Request Smuggling 攻擊問題遭禁用
				xhr.setRequestHeader('Connection', 'keep-alive');
				xhr.setRequestHeader('Content-Length', new Buffer(_data.data).length);
				*/
			//};
		}
		$.ajax(_data);
	}
}

/******************************
	monitor.config = {
		id: "",
		url: "/resource/",
		method: "get",
		data: null,
		period: 3000,
		bind: {}
	}

	listener.config = {
		action: alert,
		dataKey: ""
	}
 ******************************/
,	monitors = {
	list: {
		monitors: []
	},
	monitors: {},
	MID: 0,
	LID: 0,

	newMID: function() {
		return (++this.MID).toString();
	},
	newLID: function() {
		return (++this.LID).toString();
	},
	addMonitor: function(_config) {
		if(!_config) {
			_config = {};
		}

		_config["id"] = this.newMID();
		var	m = new this.monitor(_config);

		this.list["monitors"].push(_config["id"]);
		this.monitors[_config["id"]] = m;

		return m;
	},
	removeMonitor: function(_monitor) {
		if(typeof(_monitor) == "undefined") {
			for(var key in this.monitors) {
				this.removeMonitor(this.monitors[key]);
			}
		}
		else {
			var _mid = _monitor.id,
				tmpIndex = this.list["monitors"].indexOf(_mid);

			if( tmpIndex >= 0 ) {
				this.list["monitors"].splice(tmpIndex, 1);
			}
			this.monitors[_mid].destroy();
			delete this.monitors[_mid];
		}
	},
	getMonitor: function(_mid) {
		if(typeof(_mid) == "undefined") {
			return this.monitors;
		}
		else {
			return this.monitors[_mid];
		}
	},
	monitor: function(_config) {
		var interval = false,
			id = "",
			config = {
				id: "",
				url: "/resource/",
				method: "get",
				data: null,
				period: 3000,
				bind: {}
			};

		for(var key in _config) {
			config[key] = _config[key];
		}
		id = config["id"];

		var
		init = function() {
			for(var key in config.bind) {
				enable();
				break;
			}
		},

		work = function() {
			// alert("work");
			getData(passData);
		},

		getData = function(_callback) {
			var tmpData = {
				url: config.url,
				data: config.data,
				success: _callback
			};
			rest[config["method"]](tmpData);
		},

		passData = function(_data) {
			//console.log(_data);
			//console.log(config["bind"]);
			for(var key in config["bind"]) {
				config["bind"][key].passData(_data);
				//console.log(config["bind"][key]);
			}
		},

		regist = function(_config) {
			if(!_config) {
				_config = {};
			}
			else if(typeof(_config) == "function") {
				_config = {
					action: _config
				};
			}

			_config["id"] = elucia.monitors.newLID();
			var l = new elucia.monitors.listener(_config);
			config.bind[_config["id"]] = l;

			enable();

			return l;
		},

		unregist = function(_listener) {
			if(typeof(_listener) == "undefined") {
				for(var key in config.bind) {
					unregist(config.bind[key]);
				}
			}
				else {
				var _lid = _listener.config["id"],
					hasListener = false;
				if(typeof(config.bind[_lid]) != "undefined") {
					config.bind[_lid].destroy();
					delete config.bind[_lid];
				}

				for(var key in config.bind) {
					hasListener = true;
				}

				if(!hasListener) {
					disable();
				}
			}
		},

		enable = function() {
			if(interval) {
				return false;
			}
			interval = setInterval((function(self) {
				return function() {
					work();
				}
			})(this), config["period"]);
		},

		disable = function() {
			clearInterval(interval);
			interval = false;
		},

		destroy = function() {
			disable();
			unregist();
		};

		var that = {
			id: id,
			init: init,
			regist: regist,
			unregist: unregist,
			enable: enable,
			disable: disable,
			destroy: destroy
		};
		return that;
	},
	listener: function(_config) {
		var config = {
			action: alert,
			dataKey: ""
		};
		for(var key in _config) {
			config[key] = _config[key];
		}

		var
		passData = function(_data) {
			var tmpData = elucia.getData(config.dataKey, _data);
			config["action"](tmpData);
		},
		destroy = function() {

		};

		var that = {
			config: config,
			passData: passData,
			destroy: destroy
		};

		return that;
	}
}

,	debug = function(_data) {
		console.log(_data);
}



window.alert = msg;
window.confirm = confirm;

var that = {
	isArray: isArray,
	getData: getData,
	displayByte: displayByte,
	translate: translate,
	msg: msg,
	confirm: confirm,
	warning: warning,
	exist: exist,
	windowToTop: windowToTop,
	focusMe: focusMe,
	unFocus: unFocus,
	openWidget: openWidget,
	checkWidgetWindow: checkWidgetWindow,
	addTemplate: addTemplate,
	loadTemplate: loadTemplate,
	addSpine: addSpine,
	addSpineTo: addSpineTo,
	add: addWidget,
	addTo: addWidgetTo,
	addTemplateTo: addTemplateTo,
	addJS: addJS,
	addCSS: addCSS,
	loadSpineWidget: loadSpineWidget,
	stringBytes: stringBytes,
	rest: rest,
	monitors: monitors,
	debug: debug
};
return that;	

})();