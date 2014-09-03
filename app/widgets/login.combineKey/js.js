module.exports = function($, elucia, win) {
		var 

		init = function(_node, _data) {
			var document = win.window.document;
			var currGetEscrowKey = $.proxy(this, "getEscrowKey");

			this.data = _data;
			this.node = _node;

			currGetEscrowKey();

			return this;
		},

		getEscrowKey = function() {
			var currSaveKey = $.proxy(this, "saveKey");
			elucia.centerRest.get({
				"path": "user/key",
				success: function(_data) {
					currSaveKey(_data.data);
				}
			});
		},

		saveKey = function(_data) {
			var Key = require("../../modules/keyEscrow.js").getKey(this.data.password, _data);
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
			getEscrowKey: getEscrowKey,
			saveKey: saveKey,
			destroy: destroy
		};

		return that;
};