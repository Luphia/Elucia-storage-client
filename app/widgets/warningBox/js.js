module.exports = function($, elucia, win) {
	var init = function(_node, _data) {
		_callback = _data.callback;

		$(_node).click(function() { return false; });
		$("div.warningMsg", _node).text(_data.message);

		if(typeof(_callback) == "function") {
			$("button", _node).on("click", function() {
				_callback(_data);
				_node.remove();
				return false;
			});
		}
		else {
			$("button", _node).on("click", function() {
				_node.remove();
				return false;
			});
		}
		return this;
	},

	that = {
		init: init
	};

	return that;
};