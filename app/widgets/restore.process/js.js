module.exports = function($, elucia, win) {
		var 

		init = function(_node, _data) {
var tmpLoading = 0;
var progress = 0;
var updateLoading = function() {
	tmpLoading ++;
	progress = parseInt(tmpLoading * 100 / 20);
	$("progress").attr("value", progress);
	$("div:nth-child(3)", _node).text("已完成 "+ tmpLoading +"/20 files ("+ tmpLoading +"0.0 MB / 200.0 MB)");

	if(tmpLoading < 20) {
		setTimeout(function() {updateLoading();}, 500);
	}
	else {
		win.window.opener.elucia.confirm("資料已復原");
		win.close();
	}
}
setTimeout(function() {updateLoading();}, 500);
		},
		destroy = function() {

		},

		that = {
			init: init,
			destroy: destroy
		};

		return that;
};