// prevent crash
process.on('uncaughtException', function(err) {
	console.log('Caught exception: ' + err);
});

var self = this;
var config, configuration;

// Load native UI library
var gui = require('nw.gui');

// Get the current window
var win = gui.Window.get();
win.setResizable(false);

win.on('minimize', function() {
	// Hide window
	this.hide();

	// Show tray
	tray = new gui.Tray({ icon: 'images/app.png' });

	// Show window and remove tray when clicked
	tray.on('click', function() {
		win.show();
		this.remove();
		tray = null;
		win.focus();
	});
});

win.on('focus', function() {
	for(var key in focusChildren) {
		focusChildren[key].focus();
	}
});

// $("div.key").click(function() { $(this).toggleClass("unsave").toggleClass("save"); });
$("div.controll > div.dev").click(function() { win.showDevTools(); });
$("div.controll > div.minimize").click(function() { win.minimize(); });
$("div.controll > div.fullscreen").click(function() { win.toggleFullscreen(); });
$("div.controll > div.close").click(function() { win.close(); });
$("div.controll > div.question").click(function() {
	var widget = {
		name: "question",
		data: {}
	};
	elucia.openWidget(widget);
});
$("div.controll > div.file").click(function() { 
	var widget = {
		name: "backup.state",
		data: {
			localDir: 'D:/SVN/openstack/develop/Backend/iServStorage/Desktop/app/ui_common',
			backupDir: '/portable/'
		}
	};
	elucia.openWidget(widget);
});

var mainFn

, openPage = function(_page, _arg) {
	var link = "./widget.html#" + _page;
	var subWin = win.window.open(link);
	focusTo(subWin);
}

, alert = function() {

}

, getConfig = function(_data) {
	elucia.config.user = {
		"clientID": _data.clientId,
		"username": _data.username,
		"haskey": _data.haskey,
		"escrow": _data.escrow
	};
	$("body > div.footer > div.user").text(_data.username);
	$("body > div.footer > div.key").removeClass(_data.escrow? "unsave": "save").addClass(_data.escrow? "save": "unsave");
}

, reloadConfig = function() {
	elucia.centerRest.get({
		"path": "user",
		success: function(_data) {
			getConfig(_data.data);
		}
	});
}

, checkConfig = function() {
	var loginWidget = {
		"name": "login",
		"data": {
			afterLogin: function(_data) {
				elucia.add("main");
				getConfig(_data);

				if(!elucia.config.localKey) 
				{
					if(!_data.haskey) 
					{
						elucia.openWidget({"name": "login.newKey", "data": _data});
					}
					else if(!_data.escrow) 
					{
						elucia.openWidget({"name": "login.importKey", "data": _data});
					}
					else
					{
						elucia.openWidget({"name": "login.combineKey", "data": _data});
					}
				}
				else if(!_data.haskey) {

				}
			}
		}
	};

	var mainWidget = {
		"name": "main",
		"data": {}
	}
	elucia.add(loginWidget, function(_node, _data, _obj) {
		config = _obj.config;
		elucia.config = configuration = config.get();
		config.update = function() {
			this.save();
			elucia.config = configuration = this.get();
			reloadConfig();
		};
		elucia.configOBJ = config;
	});
}
;

checkConfig();