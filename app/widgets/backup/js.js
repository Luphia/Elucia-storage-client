module.exports = function($, elucia, win) {
	var 

	init = function(_node, _data) {

		if(typeof(_data) != "undefined") {
			if(typeof(_data.container) != "undefined") {}
			if(typeof(_data.keep) != "undefined") {}
			if(typeof(_data.container) != "undefined") {}
		}

		this.node = _node;
		var currBackup = $.proxy(this, "startBackup");
		var currGetdiskSpace = $.proxy(this,"getDiskUasge");
		var currCalc = $.proxy(this, "calc");
		var currGetBackupdata = $.proxy(this,"getBackupData");
		var currAddPath = $.proxy(this,"addPath");
		var currDeletePath = $.proxy(this,"deletePath");
		var switchObj; 
		var maxSize;
		var that = this;

		currGetdiskSpace();
		currGetBackupdata();

		$("div.operate > button", this.node).click(function() { currBackup("backupNow"); });
		// $("div.dir", this.node).click(function(ev) { $(this).toggleClass("select"); currCalc(); });
		elucia.addTo({"name":"switch","data":{on:$.proxy(this,"on"),off: $.proxy(this,"off")}}, $("div.schedule", this.node),function(_node,_data,_switcjObj){
			that.switchObj = _switcjObj;
		});
		
		$("div.title > a.clickable",this.node).click(function() { currAddPath(); });	

		$("div.delete",this.node).click(function() { currDeletePath(); });

		return this;
	},

	on = function()
	{	console.log("on");
		var postData = 
		{
			"enable": true
		} 

		var data = 
		{
			url: "http://"+elucia.config.agent.host+":"+elucia.config.agent.port+"/backup_setting",
			data: postData,
			success: function(_data) 
			{			console.log(_data);	
				if(_data.result == 1) 
				{
					console.log("backup enable ok");
				}
				else 
				{
					console.log("backup enable error");
				}
			}
		};

		//backup setting
		elucia.rest.post(data);
	},

	off = function()
	{	console.log("off");
		var postData = 
		{
			"enable": false
		} 

		//console.log("http://"+elucia.config.agent.host+":"+elucia.config.agent.port+"/backup_setting");
		var data = 
		{
			url: "http://"+elucia.config.agent.host+":"+elucia.config.agent.port+"/backup_setting",
			data: postData,
			success: function(_data) 
			{			console.log(_data);	
				if(_data.result == 1) 
				{
					console.log("backup enable ok");
				}
				else 
				{
					console.log("backup enable error");
				}
			}
		};

		//backup setting
		elucia.rest.post(data);
	},

	calc = function() 
	{
		var totalSize = 0;
		var count = 0;
		var time = 0;
		$("div.dir.select", this.node).each(function() 
		{
			totalSize += parseInt($(this).attr("size"));
			count++;
		});

		var space = elucia.displayByte(totalSize);
		var time = parseInt(totalSize / 100 / 1024 / 60);
		var percentage = (Math.round(totalSize/that.maxSize*100)/100)*100


		$("div.operate > button", this.node).attr("disabled", (count == 0));
		$("div.summary > div.space > div:nth-child(1)", this.node).text("需要空間 " + space[2]);
		$("div.summary > div.space > div.progress > div.bar2", this.node).css("width", percentage + "%");
		$("div.summary > div.time", this.node).text("約 " + time + " 分鐘");
	},

	deletePath = function()
	{
		var currBackup = $.proxy(this, "startBackup");
		var count = 0;
		var positionTop = $("div.delete",this.node).position().top;
		var positionLeft = $("div.delete",this.node).position().left;
		var count = $("div.dir.select", this.node).size();

		if(count == 0)
		{
			return false;
		}
		else
		{
			var i = 0;
			$("div.list", this.node).css("overflow-y","hidden");
			$("div.dir.select", this.node).each(function(index,dom)
			{
				$(this).html("").css("background","#000");
				$(this).animate({width:"1px",height:"1px",left:"400px"},function()
				{
					position = 
					{
						"left":positionLeft-30,
						"top":positionTop+10
					};

					$(this).animate(position,1200,function()
					{
						i++;
						$(this).remove();
						finish();
					});
				});
			});

			finish = function()
			{
				if(i == count)
				{
					$("div.list", this.node).css("overflow-y","auto");
					currBackup("deletePath");
				}
			}
		}
	},

	addPath = function()
	{
		var currCalc = $.proxy(this, "calc"),
			curStartBackup = $.proxy(this, "startBackup");
		var chooseFolder = $('<input type="file" nwdirectory />').click();
			chooseFolder.change( function() 
			{
				var dir = require('dir-util'), 
					that = this;
		
				dir.getSize(this.value, {}, function(err, size) 
				{
				    var hex = 
					{
						"host":elucia.config.agent.name,
						"path":that.value
					}


					hex = "__"+new Buffer(JSON.stringify(hex)).toString('hex');

					var mainDiv = $("<div>").addClass("dir").addClass("select").addClass("info").attr("size",size);
					var divPath = $("<div>").text(that.value).append($("<input>").attr("type","hidden").attr("name","virtual").val(hex));
					var divSize = $("<div>").text(elucia.displayByte(size)[2]);
					var divMsg = $("<div>").append($("<div>").text("備份所需時間"));

					divMsg.click(function() 
					{
						var widget = 
						{
							name: "backup.state",
							data: 
							{
								localDir: that.value,
								backupDir: "/" + hex + "/"
							}
						};

						elucia.openWidget(widget);

						return false;
					});

					mainDiv.append(divPath).append(divSize).append(divMsg);
					$("div.list",that.node).append(mainDiv);

					currCalc();

					//click
					$(mainDiv).click(function(ev)
					{ 
						$(this).toggleClass("select"); 
						currCalc(); 						
					});

					//send list
					curStartBackup();
				});	
			});		
	},

	getBackupData = function()
	{
		$("div.list",this.node).html("");

		var that = this,
			serverIp = elucia.config.agent.host,
			port = elucia.config.agent.port;

		elucia.rest.get(
		{
			url: "http://"+serverIp+":"+port+"/backup_setting",
			success: that.setBackupDir
		}); 
	},

	setBackupDir = function(_data)
	{	
		var backup = _data.data.backup;//window.console.log(_data.data);
		var currCalc = $.proxy(this,"calc");

		//switch button
		if(_data.data.enable)
		{
			//window.console.log(that.switchObj);
			that.switchObj.on()
		}
		else
		{
			that.switchObj.off()
		}

		for(var key in backup.real)
		{

			var mainDiv = $("<div>").addClass("dir").addClass("info").attr("size",0).attr("localDir", backup.real[key]).attr("backupDir", "/" + backup.virtual[key] + "/");
			if((typeof(backup.enabled) == "object" && backup.enabled[key] == 1) || (typeof(backup.enabled) == "boolean" && backup.enabled))
			{
				mainDiv.addClass("select");
			}

			var divPath = $("<div>").text(backup.real[key]).append($("<input>").attr("type","hidden").attr("name","virtual").val(backup.virtual[key]));
			var divSize = $("<div>").text(elucia.displayByte(0)[2]);
			var divMsg = $("<div>").append($("<div>").text("上次備份時間"));

			divMsg.click(function(e) 
			{
				var dirTag = $(e.currentTarget.parentElement);
				elucia.openWidget(
				{
					name: "backup.state",
					data: 
					{
						localDir: dirTag.attr("localDir"),
						backupDir: dirTag.attr("backupDir")
					}
				});

				return false;
			});

			mainDiv.append(divPath).append(divSize).append(divMsg);
			$("div.list",this.node).append(mainDiv);
		}

		
		//backup button
		calc();

		//click
		$("div.dir", this.node).click(function(ev) 
		{
			$(this).toggleClass("select");calc(); 
		});


	},

	getDiskUasge = function()
	{
		elucia.centerRest.get(
		{
			path: "manage/client/diskUsage",
			success: function(_data)
			{
				//console.log(_data.data.bytes);console.log(_data.data.maxsize);
				_data.data.bytes = (_data.data.bytes == null)? 0 : _data.data.bytes;
				_data.data.maxsize = (_data.data.maxsize == null)? 0 : _data.data.maxsize;
				
				var value = (_data.data.maxsize == 0)? 0 : (Math.round(_data.data.bytes/_data.data.maxsize*100)/100)*100
				
				that.maxSize = _data.data.maxsize;
				//total progress
				$("div.progress", this.node).attr("max",100);

				//used progress
				$("div.progress > div.bar1", this.node).css({"width":value+"%"});
				$("div.progress > div.bar2", this.node).css({"left":value+"%"});
				
			}
		}); 
	};

	startBackup = function(action) 
	{
		var realArray = [],
			visualArray = [],
			enable = [];

		$("div.info > div:first-child",this.node).each(function(index,domEle)
		{
			realArray.push($(this).text());	
			visualArray.push($("input[name=virtual]",$(this)).val());

			if($(this).parent().hasClass("select"))
			{
				enable.push(1);
			}
			else
			{
				enable.push(0);
			}
			
		});

		var postData = 
		{
			"enable": true,
			"period": 30,
			"backup":
			{
				"real": realArray, 
				"virtual": visualArray,
				"enabled":enable
			}
		} 

		//console.log("http://"+elucia.config.agent.host+":"+elucia.config.agent.port+"/backup_setting");
		var data = 
		{
			url: "http://"+elucia.config.agent.host+":"+elucia.config.agent.port+"/backup_setting",
			data: postData,
			success: function(_data) 
			{			console.log(_data);	
				if(_data.result == 1) 
				{
					console.log("backup list ok");
				}
				else 
				{
					console.log("backup list error");
				}
			}
		};

		//backup setting
		elucia.rest.post(data);

		//backupNow
		if(action == "backupNow")
		{
			//backup setting now
			var data = 
			{
				url: "http://"+elucia.config.agent.host+":"+elucia.config.agent.port+"/backup_setting",
				data: 
				{
					"backup_now": true
				},
				success: function(_data) 
				{			
					if(_data.result == 1) 
					{
						console.log("backup now ok");
					}
					else 
					{
						console.log("backup now error");
					}
				}
			};	

			elucia.openWidget("backup.process");

			//backup setting
			elucia.rest.post(data);
		}
	},

	switchOnClose = function()
	{
		$("div.schedule", this.node)
	},

	destroy = function() {

	},

	that = {
		init: init,
		startBackup: startBackup,
		addPath:addPath,
		deletePath:deletePath,
		getDiskUasge:getDiskUasge,
		on:on,
		off:off,
		setBackupDir:setBackupDir,
		getBackupData:getBackupData,
		calc: calc,
		destroy: destroy
	};

	return that;
};