module.exports = function($, elucia) {
	var

	init = function(_node, _data) {
		var currGetRestoreDetail = $.proxy(this, 'getRestoreDetail');

		currGetRestoreDetail(_data);

		return this;
	},

	getRestoreDetail = function(_time) {
		var request = {
			path: "listrestorelog/"+_time,
			success: function(response) {
				$('div.restore_detail > div.beginTime').text("還原起始時間："+response.data.beginTime);
				$('div.restore_detail > div.endTime').text("還原結束時間："+response.data.endTime);
				$('div.restore_detail > div.durTime').text("還原花費時間："+response.data.durTime);
				var capacity = elucia.displayByte(response.data.downloadSucceedSizes)[2];
				$('div.restore_detail > div.diskCapacity').text("還原佔用空間："+capacity);
				$('div.restore_detail > div.fileCount').text("還原檔案個數："+response.data.downloadSucceedFiles);
				for (var key in response.data.done) {
					var localPath = response.data.done[key].lpath;
					if (response.data.done[key].size > 0 ) {
						$('div.restore_detail > div.fileList').append('<div class="file"><div class="name">'
						+ getFileName(localPath)
						+'</div><div class="path">'+ getFilePath(localPath) +'</div></div>');
					}
				}
			}
		};
		elucia.agentRest.get(request);
	},

	getFileName = function(_path) {
		var lastIndex = _path.lastIndexOf('/'),
			fileName = _path.slice(lastIndex+1);
		return fileName;
	},

	getFilePath = function(_path) {
		var lastIndex = _path.lastIndexOf('/'),
			filePath = _path.slice(0, lastIndex+1);
		return filePath;
	},

	that = {
		init: init,
		getRestoreDetail: getRestoreDetail
	};

	return that;
};