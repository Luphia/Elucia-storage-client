var self = this;

// Load native UI library
var gui = require('nw.gui');

// Get the current window
var win = gui.Window.get();
win.setResizable(false);

win.window.onunload = function() {
	this.opener.elucia.unFocus(this.win.routing_id);
}


$("div.controll > div.dev").click(function() { win.showDevTools(); });
$("div.controll > div.close").click(function() { win.close(); });
var widget = JSON.parse(atob(location.hash.substr(1)));
elucia.add(widget, function(_node, _data, _obj) {
	var headerHeight = parseInt($("div.header").css("padding-top")) + parseInt($("div.header").css("padding-bottom")) + $("body > div.header").height();
	var width = _node.width();
	var height = _node.height() + headerHeight;
	var moveX = parseInt((win.window.opener.win.width - width) / 2);
	var moveY = parseInt((win.window.opener.win.height - height) / 2);

	win.resizeTo(width, height);
	win.moveBy(moveX, moveY);
	console.log([width, height, moveX, moveY]);
});