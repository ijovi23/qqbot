var http = require('http');
var querystring = require('querystring');

var TuringBotApiKey = "c7b8f3c580d9f6c275d07ee5c245e4bb";

var TuringBotApiUrl = "www.tuling123.com";
var TuringBotApiUrlPath = "/openapi/api";

var sendMsg = function (msg, cb) {
	msg = String(msg);

	var replyData = '';

	var postBody = {
		'key'  : TuringBotApiKey,
		'info' : msg
	};

	if (stringContains(msg, '天气')) {
		postBody.loc = '嘉兴市';
	};

	var postData = querystring.stringify(postBody);

	var options = {
		hostname: TuringBotApiUrl,
		// port: 80,
		path: TuringBotApiUrlPath,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
			'Content-Length': postData.length
		}
	};

	var req = http.request(options, (res) => {
		res.setEncoding('utf8');
		res.on('data', (chunk) => {
			replyData += chunk;
		});
		res.on('end', () => {
			console.log('No more data in response.')
			process_response(replyData, cb);
		})
	});

	req.on('error', (e) => {
		console.log('TuringBotError: ' + e.message);
	});

	// write data to request body
	req.write(postData);
	req.end();
}

function process_response (data, cb) {
	if (!data) {
		cb('Turing response error!');
	}

	var retText = '';

	var resObj = JSON.parse(data);
	var code = resObj.code;

	switch (Number(code)) {
		case 100000: {
			//文本类
			retText += resObj.text;
			break;
		}
		case 200000: {
			//链接类
			retText += resObj.text + '\n' + resObj.url;
			break;
		}
		case 302000: {
			//新闻类
			retText += resObj.text;
			var resList = thinList(resObj.list);
			for (var i = 0; i < resList.length && i < 3; i++) {
				var listObj = resList[i];
				retText += '\n' + listObj.article + '\n' + listObj.detailurl;
			}
			break;
		}
		case 308000: {
			//菜谱类
			retText += resObj.text;
			var resList = thinList(resObj.list);
			for (var i = 0; i < resList.length && i < 3; i++) {
				var listObj = resList[i];
				retText += '\n' + listObj.name + '\n' + listObj.info + '\n' + listObj.detailurl;
			}
			break;
		}
		default : {
			retText += resObj.text;
		}
	}

	if (cb) {
		cb(null, retText);
	};
}

function thinList (list) {
	var retList = [];
	if (list.length > 3) {
		for (var i = 0; i < 3; i++) {
			var arrIndex = Math.floor(Math.random()*list.length);
			retList.push(list[arrIndex]);
			list.splice(arrIndex, 1);
		};
	}else{
		retList = list;
	}
	return retList;
}

function stringContains (str1, str2) {
	if (str1 != null && str2 != null && str1.indexOf(str2) >= 0) {
		return true;
	}else{
		return false;
	}
}

module.exports = {
	sendMsg: sendMsg
}