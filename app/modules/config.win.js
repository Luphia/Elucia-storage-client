// 建立資料夾
// 檢查是否存在 config 檔
	// 建立 config 檔
// 檢查是否存在 user 檔
	// 建立 user 檔
var fs = require('fs');
var nconf = require('nconf');
var target = process.env.LOCALAPPDATA + "\\iServStorage\\";
var templatePath = "../config/config.json";

module.exports = {
	checkConfig: function() {
		fs.mkdir(target, 0777, function() {});

		var configPath = target + "config";
		var defaultConfig = require(templatePath);

		defaultConfig.agent.name = process.env.COMPUTERNAME;

		var myConfig = nconf.defaults(defaultConfig);
		myConfig.file({file: configPath});

		return myConfig;
	},
	checkUser: function() {

	}
};