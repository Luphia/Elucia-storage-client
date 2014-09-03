module.exports = function($, elucia) {
		var node,

		init = function(_node, _data) {
			node = _node;
			$('div#list_id', _node).text(_data.id);
			$('div.name', _node).text(_data.name);
			$('div.visual_name', _node).text(_data.name);
			if (_data.isDir) {
				$('div#icon', _node).addClass('folder');
				$('div.scale', _node).hide();
				$('div.type', _node).text('folder');
				$('div.visual_type', _node).text('folder');				
			}	
			else {
				$('div#icon', _node).addClass('file');
				$('div.size', _node).text(_data.size);
				var scale = elucia.displayByte(parseInt(_data.size))[2];
				$('div.scale', _node).text(scale);
				$('div.type', _node).text(_data.type);
				$('div.visual_type', _node).text(shortTypeName(_data.type));
			}
			$('img#img', _node).prop('src','./images/wait.png');
			$('img#img', _node).addClass('wait');
			return this;
		},

		setState = function(_state) {
			$('div.state', node).text(_state);
			$('img#img', node).removeClass('wait');
			if (_state == 1) {
				$('img#img', node).prop('src','./images/check.png');	
			}
			else if (_state == 2) {
				$('img#img', node).prop('src','./images/backuping.png');	
			}
			else if (_state == 3) {
				$('img#img', node).prop('src','./images/clock.png');
			}
			else {
				$('img#img', node).prop('src','./images/warning.png');	
			}
		},

		shortTypeName = function(_name) {
			var sliceIndex = _name.search('/');
			if (sliceIndex == -1) return _name;
			else {
				var shortName = _name.slice(sliceIndex+1);
				return shortName;
			}
		},

		wait = function() {
			//$('img#img', node).css('-webkit-transform');
		},

		destroy = function() {

		},

		that = {
			init: init,
			setState: setState,
			destroy: destroy
		};

		return that;
};