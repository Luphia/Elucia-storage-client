module.exports = function($, elucia) {
		var 

		init = function(_node, _data) {
			var currGetBackupList = $.proxy(this, 'getBackupList'),
				currGetRestoreList = $.proxy(this, 'getRestoreList');

			currGetBackupList(function() {
				var lastestDay = $('div.backup_list div.dir div.date:last', _node).text();
				$('div.backup_lastestDay', _node).text("最近備份日期 "+lastestDay);
				$('div.backup_list div.dir', _node).click(function() {
					var time = $(this).children('div.date').text(),
						widget = {
							name: "status.backup",
							data: time
						};
					elucia.openWidget(widget);
				});
			});
			currGetRestoreList(function() {
				$('div.restore_list div.dir', _node).click(function() {
					var time = $(this).children('div.date').text(),
						widget = {
							name: "status.restore",
							data: time
						};
					elucia.openWidget(widget);
				});
			});		

			return this;
		},

		destroy = function() {

		},

		displayTime = function(_time) {
			var array = _time.split(':'),
				result = "";
			for (var key in array) {
				if (key == 0) {
					result = result.concat(array[key]+" 時 ");
				} else if (key == 1) {
					result = result.concat(array[key]+" 分 ");
				} else {
					result = result.concat(array[key]+" 秒");
				}
			}
			return result;
		},

		getBackupDay = function(done) {
			var request = {
				path: "listbackuplog/",
				success: function(response) {
					if (response.result == 1) {
						console.log("getBackupDay success");
						if (response.data.day.length > 0) {
							var i = 0;
							(function next() {
								var day = response.data.day[i++];
								if (!day) return done();
								getBackupTime(day, function() {
									next();
								})
							})();
						}
						else
							console.log("empty data");
					}
					else {
						console.log("getBackupDay error");
					}
				}
			};
			elucia.agentRest.get(request);
		},

		getBackupDetail = function(_time, _callback) {
			var request = {
				path: "listbackuplog/"+_time,
				success: function(response) {
					if (response.result == 1) {
						if (response.data.uploadSucceedFiles > 0)
							_callback(true, response.data);
						else
							_callback(false);
					} else {
						_callback(false);
					}
				}
			};
			elucia.agentRest.get(request);
		},

		getBackupList = function(_callback) {
			getBackupDay(function() {
				console.log("getBackupList done");
				_callback();
			});
		},

		getBackupTime = function(_day, _callback) {
			var request = {
				path: "listbackuplog/"+_day,
				success: function(response) {
					if (response.result == 1) {
						console.log("getBackupTime success");
						if (response.data.time.length > 0) {
							var i = 0;
							(function next() {
								var time = response.data.time[i++];
								if (!time) return _callback();
								getBackupDetail(_day+time, function(hasDetail, data) {
									if (hasDetail) {
										$('div.backup_list').append('<div class="dir"><div class="date">'
											+_day+time+'</div><div class="capacity">'
											+elucia.displayByte(data.uploadSucceedSizes)[2]+'</div><div class="time">'
											+displayTime(data.durTime)+'</div></div>');
									}
									next();
								})
							})();
						}
						else
							console.log("empty data");
					}
					else {
						console.log("getBackupTime error");
						_callback();
					}
				}
			};
			elucia.agentRest.get(request);
		},

		getRestoreDay = function(done) {
			var request = {
				path: "listrestorelog/",
				success: function(response) {
					if (response.result == 1) {
						console.log("getRestoreDay success");
						if (response.data.day.length > 0) {
							var i = 0;
							(function next() {
								var day = response.data.day[i++];
								if (!day) return done();
								getRestoreTime(day, function() {
									next();
								})
							})();
						}
						else
							console.log("empty data");
					}
					else {
						console.log("getRestoreDay error");
					}
				}
			};
			elucia.agentRest.get(request);
		},

		getRestoreDetail = function(_time, _callback) {
			var request = {
				path: "listrestorelog/"+_time,
				success: function(response) {
					if (response.result == 1) {
						if (response.data.downloadSucceedFiles > 0)
							_callback(true, response.data);
						else
							_callback(false);
					} else {
						_callback(false);
					}
				}
			};
			elucia.agentRest.get(request);
		},

		getRestoreList = function(_callback) {
			getRestoreDay(function() {
				console.log("getRestoreList done");
				_callback();
			});
		},

		getRestoreTime = function(_day, _callback) {
			var request = {
				path: "listrestorelog/"+_day,
				success: function(response) {
					if (response.result == 1) {
						console.log("getRestoreTime success");
						if (response.data.time.length > 0) {
							var i = 0;
							(function next() {
								var time = response.data.time[i++];
								if (!time) return _callback();
								getRestoreDetail(_day+time, function(hasDetail, data) {
									if (hasDetail) {
										$('div.restore_list').append('<div class="dir"><div class="date">'
											+_day+time+'</div><div class="capacity">'
											+elucia.displayByte(data.downloadSucceedSizes)[2]+'</div><div class="time">'
											+displayTime(data.durTime)+'</div></div>');
									}
									next();
								})
							})();
							/*for (var key in response.data.time) {
								$('div.restore_list').append('<div class="dir">'+_day+response.data.time[key]+'</div>');
							}*/
						}
						else
							console.log("empty data");
					}
					else {
						console.log("getRestoreTime error");
						_callback && _callback();
					}	
				}
			};
			elucia.agentRest.get(request);
		},

		that = {
			init: init,
			getBackupList: getBackupList,
			getRestoreList: getRestoreList,
			destroy: destroy
		};

		return that;
};