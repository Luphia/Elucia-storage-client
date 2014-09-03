module.exports = function($, elucia, win) {
		var 

		init = function(_node, _data) {
			var document = win.window.document;
			var currSaveKey = $.proxy(this, "saveKey");

function handleDragStart(e) {
	this.style.opacity = '0.4';
}

function handleDragOver(e) {
	if (e.preventDefault) {
		e.preventDefault();
	}

	e.dataTransfer.dropEffect = 'move';

	return false;
}

function handleDragEnter(e) {
	this.classList.add('over');
}

function handleDragLeave(e) {
	this.classList.remove('over');
}
function handleDrop(e) {
	e.preventDefault();
	var file = e.dataTransfer.files[0] ;
	var fileBuffer = require("fs").readFileSync(file.path);

	currSaveKey(fileBuffer.toString());
	this.classList.add('check');
}

var cols = document.querySelectorAll('.importKey');
[].forEach.call(cols, function(col) {
	col.addEventListener('dragstart', handleDragStart, false);
	col.addEventListener('dragenter', handleDragEnter, false);
	col.addEventListener('dragover', handleDragOver, false);
	col.addEventListener('dragleave', handleDragLeave, false);
	col.addEventListener('drop', handleDrop, false);
});
			return this;
		},

		saveKey = function(_data) {
			var Key = _data;
			console.log(Key);
			elucia.agentRest.post({
				"path": "setkey",
				"data": Key,
				success: function(__data) {
					elucia.configOBJ.set("localKey", true);
					elucia.configOBJ.update();
					win.close();
				}
			});
		},

		destroy = function() {

		},

		that = {
			init: init,
			saveKey: saveKey,
			destroy: destroy
		};

		return that;
};