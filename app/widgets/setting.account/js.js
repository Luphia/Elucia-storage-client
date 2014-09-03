module.exports = function($, elucia, win) {
		var 

		init = function(_node, _data) 
		{
			this.node = _node;
			var currSubmit = $.proxy(this,"submitPwd");
			var	currSetConfig = $.proxy(this,"setConfig");

			$("input[name=sendData]").click(function(){currSubmit()});
			$("input[name=sendAuthData]").click(function(){currSetConfig()});

			$("div.setting > div.menuDiv > div").click(function()
			{
				if($(this).hasClass("selected"))
				{
					return false;
				}
				else
				{
					$("div.setting > div.contentDiv > div").hide();
					$("div.setting > div.menuDiv > div").removeClass("selected");
					$(this).addClass("selected");
					if($(this).hasClass("updpwdMenu"))
					{
						$("div.setting > div.contentDiv div.updatePwd").fadeIn();
					}
					else
					{
						$("div.setting > div.contentDiv div.authData").fadeIn();
					}
				}
			});

			return this;
		},

		submitPwd = function()
		{
			var pwdOri = $("input[name=pwdOri]").val();
			var pwd1 = $("input[name=pwd1]").val();
			var pwd2 = $("input[name=pwd2]").val();
	
			
			//remove span msg
			$("div.setting table.setting span.msg").remove();			
			if(pwdOri != "")
			{
				var span = $("<span>").addClass("msg").css("color","red").text("必填");
				if(pwd1 == "" || pwd2 == "")
				{
					if(pwd1 == "")
					{
						$("input[name=pwd1]").after(span.clone());
						return false;
					}

					if(pwd2 == "")
					{
						$("input[name=pwd2]").after(span.clone());
						return false;
					}
				}
				else if(pwd1 != pwd2)
				{
					var span = $("<span>").addClass("msg").css("color","red").text("驗證失敗");
					$("input[name=pwd2]").after(span);
					return false;
				}

				
				elucia.centerRest.put(
				{
					path: "manage/client/updatePwd",
					data: {"newPassword":pwd1,"oldPassword":pwdOri},
					success: function(_data)
					{	console.log(_data);
						if(_data.result == 0)
						{
							if(_data.message == "password error")
							{
								var span = $("<span>").addClass("msg").css("color","red").text("驗證失敗");
								$("input[name=pwdOri]").after(span);
							}
						}
						else
						{
							win.close();
						}			
					}
				}); 
			}
			else
			{
				win.close();
			}	
		},

		setConfig = function()
		{
			var dataRestore = ($("div.authData input[name=dataRestore]").prop("checked"))? true : false;
			var dataBackup = ($("div.authData input[name=dataBackup]").prop("checked"))? true : false;
			var backupSetting = ($("div.authData input[name=backupSetting]").prop("checked"))? true : false;

			console.log(dataRestore);
			console.log(dataBackup);
			console.log(backupSetting);
			
			elucia.configOBJ.set("authSetting:dataRestore",dataRestore);
			elucia.configOBJ.set("authSetting:dataBackup",dataBackup);
			elucia.configOBJ.set("authSetting:backupSetting",backupSetting);
			elucia.configOBJ.update();
			win.close();
		}


		destroy = function() {

		},

		
		that = {
			init: init,
			submitPwd:submitPwd,
			setConfig:setConfig,
			destroy: destroy
		};

		return that;
};