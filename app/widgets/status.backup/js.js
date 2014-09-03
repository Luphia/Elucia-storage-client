module.exports = function($, elucia) {
	var

	init = function(_node, _data) {
		var currGetBackupDetail = $.proxy(this, 'getBackupDetail');

		currGetBackupDetail(_data, function(response) {
			$('div.backup_detail > div.beginTime').text("備份起始時間："+response.data.beginTime);
			$('div.backup_detail > div.endTime').text("備份結束時間："+response.data.endTime);
			$('div.backup_detail > div.durTime').text("備份花費時間："+response.data.durTime);
			var capacity = elucia.displayByte(response.data.uploadSucceedSizes)[2];
			$('div.backup_detail > div.diskCapacity').text("備份消耗空間："+capacity);
			$('div.backup_detail > div.fileCount').text("備份檔案個數："+response.data.uploadSucceedFiles);
			for (var key in response.data.done) {
				var localPath = response.data.done[key].lpath;
				if (response.data.done[key].size > 0 ) {
					$('div.backup_detail > div.fileList').append('<div class="file"><div class="name">'
					+ getFileName(localPath)
					+'</div><div class="path">'+ getFilePath(localPath) +'</div></div>');
				}
			}
		});

		return this;
	},

	getBackupDetail = function(_time, _callback) {
		var request = {
			path: "listbackuplog/"+_time,
			success: function(response) {
				_callback(response);
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
		getBackupDetail: getBackupDetail
	};

	return that;
};