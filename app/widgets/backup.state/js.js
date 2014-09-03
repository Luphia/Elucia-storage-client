module.exports = function($, elucia) {
		var backupFiles,
			backupCount,
			backupSize,

		init = function(_node, _data) {
			var dir = _data.localDir,
				backupDir = "meta".concat(_data.backupDir);			
			var request = {
				path: backupDir,
				success: function(response) {
					if (response.result == 1) {
						backupFiles = response.data.files;
					} else {
						backupFiles = [];
					}
					backupCount = 0;
					backupSize = 0;
					readFolder(dir, function(err, results) {
					  	if (err) throw err;
					  	for(var i = 0; i < results.length; i++) {
					  		insertFileWidget(results[i], backupDir, _node);
					  	}
					  	insertSortWidget(_node);
					});
				}
			};
			elucia.centerRest.get(request);
			
			return this;
		},

		checkBackupState = function(souceFile, fileArray) {
			var fileMd5 = souceFile.md5,
				fileName = souceFile.name,
				fileStatus = 4,
				fileType = souceFile.type;
			for (var i = 0; i < fileArray.length; i++) {					
				var name = fileArray[i].name,
					type = fileArray[i].type,
					md5 = fileArray[i].md5,
					status = fileArray[i].status;
				if (fileName == name && fileType == type) {
					if (status == 2) {
						fileStatus = 2; // 檔案備份中
					} else {
						// 檔案備份完成
						if (fileMd5 == md5) {
							fileStatus = 1; // 最新備份 
						} else {
							fileStatus = 3; // 舊版備份
						}
					}
					return fileStatus;
				}
			}
			return fileStatus;
		},

		destroy = function() {

		},

		getBackupFiles = function(dir, callback) {
			/* call Center API */
			/* 取得已備份資料夾清單 */
			/* 若清單內無檔案，則回傳err為true */
			var request = {
				path: dir,
				success: function(response) {
					if (response.result == 1) {
						if (response.data.files.length > 0)
							callback(false, response.data.files);
						else
							callback(true);
					}
					else
						callback(true);
				}
			};
			elucia.centerRest.get(request);
		},

		insertFileWidget = function(_file, _backupDir, _node) {
			var fileEncode = require('../../modules/fileEncode'),
				path = require('path');
			var widget = {
				name: "file",
				data: _file
			};
			elucia.addTo(widget, $('div.content', _node), function(node, data, obj) {
				if (_file.isDir) {
					var dir = path.resolve(_file.path, _file.name);
					walk(_file.path, _backupDir.concat(_file.name), function(err, state) {
						obj.setState(state);
					});		
				}
				else {
					fileEncode.md5(_file.path, function(err, md5) {
						var file = {
							name: _file.name,
							type: _file.type,
							md5: md5
						};
						var state = checkBackupState(file, backupFiles);
						if (state == 3 || state == 4) {
							backupCount++;
							backupSize += _file.size;
							$('div.table > div.count', _node).text("尚須備份檔案個數："+backupCount);
							$('div.table > div.space', _node).text("所需空間："+elucia.displayByte(backupSize)[2]); 
						}
						obj.setState(state);
					});
				}
			});
		},

		insertSortWidget = function(_node) {
			var sortWidget = {
				name: "backup.sort",
				data: {name: "name"}
			};

			elucia.addTo(sortWidget, $('div.table', _node), function() {
				sortWidget.data.name = "state";
				elucia.addTo(sortWidget, $('div.table', _node), function(_element) {
					_element.children('div.rule').click().click();	
					sortWidget.data.name = "size";
					elucia.addTo(sortWidget, $('div.table', _node), function() {
						$('div.table', _node).append('<div class="count"></div><div class="space"></div>');
						$('div.table > div.count', _node).text("尚須備份檔案個數：0");
						$('div.table > div.space', _node).text("所需空間：0 Byte"); 
					});
				});
			});
		}

		readFolder = function(dir, done) {
			var fs = require('fs'),
				mime = require('../../node_modules/mime'),
				path = require('path'),
				results = [];
			fs.readdir(dir, function(err, list) {
				if (err) return done(err);
console.log(list);
				var i = 0;
				(function next() {
					var fileName = list[i++];
					if (!fileName) return done(null, results); 
					var filePath = path.resolve(dir, fileName);
					fs.stat(filePath, function(err, stat) {
						var data = {
							name: fileName,
							id: i,
							isDir: stat.isDirectory(),
							size: stat.size,
							path: filePath
						};
						if (stat && stat.isFile()) data.type = mime.lookup(fileName);
						results.push(data);
						next();
					});
				})();
			});
		},

		walk = function(dir, backupDir, done) {
			var fileEncode = require('../../modules/fileEncode'),
				fs = require('fs'),
				mime = require('../../node_modules/mime'),
				path = require('path'),
				hasBackup = 1,
				connectErr = false;
			getBackupFiles(backupDir, function(err, _backupFiles) {
				if (err)  {
					hasBackup = 4;
					connectErr = true;
				}					
				fs.readdir(dir, function(error, list) {
					if (error) return done(error);						
					var i = 0;
					(function next() {
						var fileName = list[i++];
						if (!fileName) return done(null, hasBackup);	
						var filePath = path.resolve(dir, fileName);					
						fs.stat(filePath, function(err, stat) {
							if (stat && stat.isDirectory()) {
								walk(filePath, backupDir.concat(fileName+'/'), function(err, res) {
									next();
								});
							} else {
								if (connectErr) {
									backupCount++;
									backupSize += stat.size;
									$('div.table > div.count').text("尚須備份檔案個數："+backupCount);
									$('div.table > div.space').text("所需空間："+elucia.displayByte(backupSize)[2]);
									next();
								} else {
									fileEncode.md5(filePath, function(err, md5) {
										var file = {
											name: fileName,
											type: mime.lookup(fileName),
											md5: md5
										};
										var state = checkBackupState(file, _backupFiles);
										if (state == 3 || state == 4) {
											backupCount++;
											backupSize += stat.size;
											hasBackup = 4;
											$('div.table > div.count').text("尚須備份檔案個數："+backupCount);
											$('div.table > div.space').text("所需空間："+elucia.displayByte(backupSize)[2]);
										}
										next();
									});
								}									
							}
						});
					})();
				});
			});
		};

		that = {
			init: init,
			destroy: destroy
		};

		return that;
};