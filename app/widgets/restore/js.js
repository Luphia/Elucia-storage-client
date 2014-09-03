module.exports = function($, elucia, win) {
	var 

	init = function(_node, _data) {

		if(typeof(_data) != "undefined") {
			if(typeof(_data.container) != "undefined") {}
			if(typeof(_data.keep) != "undefined") {}
			if(typeof(_data.container) != "undefined") {}
		}

		this.node = _node;
		var currRestore = $.proxy(this, "startRestore");
		var currCalc = $.proxy(this, "calc");
		var currGetRestoreData = $.proxy(this,"getRestoreData");

		currGetRestoreData();

		return this;
	},
	calc = function() {
		var totalSize = 0;
		var count = 0;
		var time = 0;
		$("div.dir.select", this.node).each(function() {
			totalSize += parseInt($(this).attr("size"));
			count++;
		});

		var space = elucia.displayByte(totalSize);
		var time = parseInt(totalSize / 100 / 1024 / 60);
		var percentage = parseInt(totalSize * 100 / (1024 * 1024 * 1024 * 10));

		$("div.operate > button", this.node).attr("disabled", (count == 0));
		$("div.summary > div.space > div:nth-child(1)", this.node).text("需要空間 " + space[2]);
		$("div.summary > div.space > div.progress > div.bar2", this.node).css("width", percentage + "%");
		$("div.summary > div.time", this.node).text("約 " + time + " 分鐘");
	},

	getRestoreData = function()
	{
		$("div.list",this.node).html("");

		var that = this,
			curSetRestoreDir = $.proxy(this,"setRestoreDir"),
			serverIp = elucia.config.server.host,
			port = elucia.config.server.port;
			//serverIp = elucia.config.agent.host,
			//port = elucia.config.agent.port;

		elucia.centerRest.get(
		{
			//url: "http://"+serverIp+":"+port+"/restore_setting",
			path: "meta/",
			success: curSetRestoreDir
		}); 
	},

	setRestoreDir = function(_data)
	{	
		var curcalc = $.proxy(this,"calc");
		var curStartRestore = $.proxy(this,"startRestore");
		var restore = _data.data.files;
		console.log(restore);
		for(var key in restore)
		{
			if(restore[key].type == "folder" && restore[key].name.indexOf("__") == 0)
			{	//console.log(restore[key]);
				var mainDiv = $("<div>").addClass("dir").attr("size",restore[key].size);

				//os
				var virtual = restore[key].name;
				virtualJson = JSON.parse(new Buffer(virtual.split("__")[1], 'hex').toString('utf8'));
				virtualName = virtualJson.host;
				virtualPath = virtualJson.path;

				var divOs = $("<div>").attr("os",""),
				divOsChildName = $("<div>").text(virtualName),
				divOsChildPath = $("<div>").text(virtualPath);
				divOs.append(divOsChildName).append(divOsChildPath);

				//path
				var divRestore = $("<div>").addClass("path"),
					divRestorePath = $("<div>").text("還原到本機..."),
					divSelectRestorePath = $("<div>").text(virtualPath);
					divSelectHiddenInput = $("<input>").attr("name","virtual").attr("type","hidden").val(virtual);
				divRestore.append(divRestorePath).append(divSelectRestorePath).append(divSelectHiddenInput);

				//info
				var divInfo = $("<div>"),
					divSize = $("<div>").text(elucia.displayByte(restore[key].size)[2]),
					divTime = $("<div>").text(/*restore[key].date*/);
				divInfo.append(divSize).append(divTime);

				mainDiv.append(divOs).append(divRestore).append(divInfo);

				$("div.list",this.node).append(mainDiv);	
			}			
		}

		$("div.operate > button", this.node).click(function() { curStartRestore(); });
		$("div.dir", this.node).click(function(ev) { $(this).toggleClass("select"); curcalc(); });
		$("div.dir > div:nth-child(2)", this.node).click(function(ev) 
		{
			var chooseFolder = $('<input type="file" nwdirectory />').click();
			//console.log(ev);
			chooseFolder.change( function() 
			{
				$("div:nth-child(2)", $(ev.currentTarget)).text(this.value);
			});
			return false;
		});

		//restore button		
		curcalc();
	},

	startRestore = function() 
	{
		console.log("start restore");
		console.log("http://"+elucia.config.agent.host+":"+elucia.config.agent.port+"/restore_setting");

		var realArray = [],
			visualArray = [];

		$("div.select > div.path > div:nth-child(2)",this.node).each(function(index,domEle)
		{
			realArray.push($(this).text());
			visualArray.push($(this).next("input[name=virtual]").val());
		});

		var postData = {
							"restore": 
							{
								"real": realArray,
								"virtual": visualArray
							}
						};

		var data = 
		{
			url: "http://"+elucia.config.agent.host+":"+elucia.config.agent.port+"/restore_setting",
			data: postData,
			success: function(_data) 
			{			//elucia.confirm(JSON.stringify(_data));	
				if(_data.result == 1) 
				{
					console.log("restore ok");
				}
				else 
				{
					console.log("restore error");
				}
			}
		};

		//restore setting
		elucia.rest.post(data);


		elucia.openWidget("restore.process");
	},
	destroy = function() {

	},

	that = {
		init: init,
		calc: calc,
		getRestoreData:getRestoreData,
		setRestoreDir:setRestoreDir,
		startRestore: startRestore,
		destroy: destroy
	};

	return that;
};