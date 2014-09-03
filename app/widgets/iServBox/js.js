module.exports = function($, elucia) {
		var 

		init = function(_node, _data) {
			/*
			_node.on('dragover', function(e) {
				e.preventDefault();
				e.stopPropagation();
			});
			*/
			_node.on('dragleave', function(e) {
				e.preventDefault();
				e.stopPropagation();
				console.log(e);
			});

			_node.on('dragenter', function(e) {
				e.preventDefault();
				e.stopPropagation();
				console.log(e);
			});

			_node.on('drop', function(event) {
				event.preventDefault();
				var items = event.originalEvent.dataTransfer.items; 
				console.log(items);
            }
        );

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