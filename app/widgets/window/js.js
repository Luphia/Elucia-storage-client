module.exports = function() {
		var node,
			data,
			widget,

		init = function(_node, _data) {
			this.node = _node;
			this.data = _data;

			this.node.animate({top: 0, left: 0}, 100);
			var os = window.$.client.os;

			var closeMe = $.proxy(this, "destroy");
			$(".operate .close", this.node).click(closeMe);

			var maxMe = $.proxy(this, "toggleMax");
			$(".operate .max", this.node).click(maxMe);

			var minMe = $.proxy(this, "toggleMin");
			$(".operate .min", this.node).click(minMe);

			return false;
		},

		toggleMax = function() {
			this.node.removeClass("min");
			this.node.toggleClass("max");
		},

		toggleMin = function() {
			this.node.removeClass("max");
			this.node.toggleClass("min");
		},

		destroy = function() {
			console.log(this);

			if(widget) {
				try {
					widget.destroy();
				} catch(e) {
					console.log("[widget " + widget.name + "] do not have destroy function");
				}
			}

			this.node.remove();
		},

		setTitle = function(_title) {
			$("div.title", this.node).text(_title);
		},

		loadWidget = function(_widget) {
			elucia.addTo(_widget, $("div.content", this.node), function(_node, _data, _obj) {
				widget = _obj;
			});
		},

		that = {
			init: init,
			destroy: destroy,
			toggleMax: toggleMax,
			toggleMin: toggleMin,
			setTitle: setTitle,
			loadWidget: loadWidget,
			node: node
		};

		return that;
};