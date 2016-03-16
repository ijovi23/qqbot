var turing = require('./turingBot');

turing.sendMsg('天气', function (err, rep) {
	console.log(err);
	console.log(rep);
});