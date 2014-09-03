module.exports = function($, elucia, win) {
		var init = function(_node, _data) {
			this.node = _node;
			this.data = _data;

			$("div.app:nth-child(1)", this.node).click(function(ev) {
				returnHome(ev);
			});
		
			$("div.app[widget]", this.node).click(function(ev) {
				loadPage(ev);
			});


			loadPage = function(ev) {
				if($(ev.currentTarget).hasClass("select")) { return true; }
				$(ev.currentTarget).parent().children("div.app.select").removeClass("select");
				$(ev.currentTarget).addClass("select");
				var body = $("div.main-body", this.node);
				var content = $("div.content", body);
				body.addClass("app");
				content.addClass("animate");
				oldDiv = $("div", content);
				var newDiv = $("<div></div>").appendTo(content);
				var widget = $(ev.currentTarget).attr("widget");
				elucia.addTo(widget, newDiv);

				var animateMove = (oldDiv.length > 0)? "-=800": "-=0";
				content.animate(
					{"margin-left": animateMove}, 
					{"duration": 300, "complete": function() { oldDiv.remove(); content.css("margin-left", 0); content.removeClass("animate"); }}
				);

				var currGetDiskUasge = $.proxy(this,"getDiskUasge");
				currGetDiskUasge();
			};
			returnHome = function(ev) {
				$("div.main-body", this.node).removeClass("app");
				$(ev.currentTarget).parent().children("div.app.select").removeClass("select");
				$("div.main-body div.content > div", this.node).remove();
			};

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
						var str = "已使用 "+elucia.displayByte(_data.data.bytes)[2] +"/"+ elucia.displayByte(_data.data.maxsize)[2];
						
						$("div.addition > div:nth-child(1) > progress", this.node).attr("value",value).attr("max",100);
						$("div.addition > div:nth-child(2)", this.node).text(str);
					}
				}); 
			};

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