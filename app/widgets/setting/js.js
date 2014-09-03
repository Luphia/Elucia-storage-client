module.exports = function($, elucia, win) {
		var 

		init = function(_node, _data) {
$("button:nth-child(1)", _node).click(function() { elucia.openWidget("setting.account"); });
$("button:nth-child(2)", _node).click(function() { elucia.openWidget("setting.key"); });
			return this;
		},

		destroy = function() {

		},

		that = {
			init: init,
			destroy: destroy
		};

		return that;
};