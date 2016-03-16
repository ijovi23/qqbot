var ch_process = require('child_process');
var error_msg = null;
pack_process = ch_process.spawn('cd', ['/Users/jovi/Repositories/']);

	pack_process.stdout.on('data', function(data) {
		console.log('stdout: ' + data);
	});

	pack_process.stderr.on('data', function(data) {
		console.log('stderr: ' + data);
		error_msg = data;
	});

	pack_process.on('exit', function(code) {

	});