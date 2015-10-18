var cp = require('child_process');
var fs = require('fs');
var _ = require('underscore');
var csvWriter = require('csv-write-stream')();

var DAY = 1000 * 3600 * 24;
var searchParams = [];
var searchProcesses = [];

_.times(2, function () {
	var leaveDate = randomDate(new Date(2015, 0, 1), new Date());
	
	var returnDate = new Date(leaveDate.getTime() + 7 * DAY);
	
	console.log(leaveDate.toISOString().match(/^\d{4}-\d{2}-\d{2}/)[0] + ' ' + returnDate.toISOString().match(/^\d{4}-\d{2}-\d{2}/)[0] );
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

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};