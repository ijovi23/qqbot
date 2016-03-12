var ch_process = require('child_process');

var reply_group = function(bot, msg) {
	var msg_content = msg.content.replace(/\s+/g, ' '); //多个空格合并
	msg_content = msg_content.replace(/(^\s*)|(\s*$)/g,''); //去除首尾空格
	var contentArray = msg_content.split(' ');
	if (stringContains(contentArray[0],'良辰')) {

		if (stringContains(contentArray[1],'帮助') ||
			stringContains(contentArray[1],'help') ||
			(stringContains(contentArray[1],'打包') && contentArray[1] != '打包')
			) {
			var helpMsg1 = '===== 自动打包帮助 =====\n'+
				'【消息格式】*我的称呼 打包 *项目编号 *类型编号 #更新描述 #版本号\n'+
				'（注：以上各参数之间用空格分开，*为必填项，#为选填项，版本号不填则使用自动生成的版本号）\n'+
				'【我的名字】在下叶良辰（叫我良辰就可以）\n'+
				'【项目编号】\n'+
				// '　　0 - 麦动\n'+
				'　　1 - 麦店宝\n'+
				'　　2 - 好好卖\n'+
				'　　3 - 乡货圈\n'+
				'　　4 - 小五哥\n'+
				'【类型编号】接口服务器类型的编号\n'+
				'　　打包指令不发送类型编号即可查询相应项目的API_Server列表\n'+
				'　　例如发送：良辰 打包 1\n'+
				'【更新描述】版本更新说明\n'+
				'【版本号】版本号格式为0.0.0(正式)或0.0.0-yyMMdd00(测试)，测试版建议使用自动生成的版本号';
			var helpMsg2 = '【举个栗子】\n'+
				'·打包麦店宝内网测试版，版本号1.0.0-16010601，该版本修复了若干bug，可以发送：\n'+
				'　良辰 打包 1 1 修复bug 1.0.0-16010601\n'+
				'·若不想添加更新描述，使用自动生成的版本号，只需发送：\n'+
				'　良辰 打包 1 1';
			bot.send_message_to_group(
				msg.from_gid,
				helpMsg1,
				function(){
					bot.send_message_to_group(msg.from_gid, helpMsg2, function(){});
				}
				);
		}
		else if (contentArray[1] == '打包') {
			if (bot.busy) {
				bot.send_message_to_group(
					msg.from_gid,
					'良辰很忙！',
					function(){}
				);
			}else{
				var arg_project = contentArray[2];
				var arg_type = contentArray[3];

				if (hasText(arg_project) && !hasText(arg_type)) {
					var result_msg = '';
					show_projectHelp(arg_project, function(err, data){
						if (err) {
							result_msg += err;
						}else{
							result_msg += data;
						}
						bot.send_message_to_group(
								msg.from_gid,
								result_msg,
								function(){}
							);
					});
				}else{
					var arg_description = contentArray[4];
					var arg_version = contentArray[5];

					bot.busy = true;
					bot.clientName = msg.from_user.nick;
					bot.send_message_to_group(
						msg.from_gid,
						'打包去了，完成时通知你',
						function(){
							make_package(arg_project, arg_type, arg_description, arg_version, function(err) {
								var result_msg = '@' + bot.clientName + ' ';
								if (err) {
									result_msg += err;
									result_msg += '\n可能发生了一些错误，可以尝试向良辰寻求帮助'
								}else{
									result_msg += '打包完成！'
								}
								bot.busy = false;
								bot.send_message_to_group(
									msg.from_gid,
									result_msg,
									function(){}
								);
							});
						}
					);
				}
			}
		}
		else if (contentArray[1] == '你好') {
			bot.send_message_to_group(
				msg.from_gid,
				msg.from_user.nick +' 你好',
				function(){}
				);
		}
		else if (contentArray[1] == '来单挑') {
			bot.send_message_to_group(
				msg.from_gid,
				'良辰最喜欢对那些自认能力出众的人出手，你若是感觉你有实力和我玩，良辰不介意奉陪到底',
				function(){}
				);
		}
		else if (contentArray[1] != null && contentArray[1].indexOf('我是') == 0) {
			var temp_msg = contentArray[1];
			bot.send_message_to_group(
				msg.from_gid,
				'就算你是'+ temp_msg.substring(2, temp_msg.length) +'又如何？',
				function(){}
				);
		}
		else {
			bot.send_message_to_group(
				msg.from_gid,
				'在下叶良辰',
				function(){}
				);
		}
	}
}

function stringContains (str1, str2) {
	if (str1 != null && str2 != null && str1.indexOf(str2) >= 0) {
		return true;
	}else{
		return false;
	}
}

function hasText (str) {
	if (str != null && typeof(str) == 'string' && str.length > 0) {
		return true;
	}
	return false;
}

function make_package (project, type, description, version, cb) {
	if (!hasText(project) || !hasText(type)) {
		cb('[ERROR]打包参数有误');
		return;
	}
	
	var cmdStr = 'bash';
	var args = ['../autopack/autopack.sh', '-a', '-p', project, '-t', type];
	if (description != null) {
		args = args.concat('-d', description);
	}
	if (version != null) {
		args = args.concat('-v', version);
	}

	var error_msg = null;

	var pack_process = ch_process.spawn(cmdStr, args);

	pack_process.stdout.on('data', function(data) {
		console.log('' + data);
	});

	pack_process.stderr.on('data', function(data) {
		console.log('[STDERR]:\n' + data);
		if (!stringContains(data, '[IDEDistributionLogging _createLoggingBundleAtPath:]')) {
			error_msg = data;
		};
	});

	pack_process.on('exit', function(code) {
		cb(error_msg);
	});
}

function show_projectHelp (project, cb) {
	if (!hasText(project)) {
		cb('[ERROR]project参数有误');
		return;
	}

	var cmdStr = '';
	cmdStr += 'source ../autopack/project_list.sh';
	cmdStr += ' && PROJ_PATH=${PROJECT_LIST['+ project +']}';
	cmdStr += ' && source ../$PROJ_PATH/autopack_config.sh';
	cmdStr += ' && echo $HelpText';

	ch_process.exec(cmdStr, function(error, stdout, stderr) {
		if (error) {
			cb('' + error);
		}else{
			cb(null, stdout);
		}
	});
}


module.exports = {
	reply_group: reply_group
}