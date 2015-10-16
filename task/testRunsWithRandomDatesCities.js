var cp = require('child_process');
var fs = require('fs');
var _ = require('underscore');
var csvWriter = require('csv-write-stream')();

var searchParams = [];
var searchProcesses = [];

_.times(2, function () {
	searchParams.push({
		leaveDate: '2015-11-15',
		returnDate: '2015-12-01',
		from: 'Shanghai',
		to: 'Bangkok'		
	});
});

csvWriter.pipe(fs.createWriteStream(process.env.PWD + '/data/testRunsWithRandomDatesCities.csv'));

searchParams.forEach(function (searchParam) {
	var ps = cp.fork(process.env.PWD + '/flightSearch.js', [searchParam.leaveDate, searchParam.returnDate, searchParam.from, searchParam.to]);

	searchProcesses.push(ps);

	ps.on('message', function (m) {
		csvWriter.write(m);
	});
});