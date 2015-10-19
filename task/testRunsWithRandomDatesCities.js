var cp = require('child_process');
var fs = require('fs');
var _ = require('underscore');
var csvWriter = require('csv-write-stream')();

var DAY = 1000 * 3600 * 24;
var searchParams = [];
var searchProcesses = [];

_.times(process.argv[2], function () {
	var dates = getFlightDates();
	console.log(dates.leaveDate + ' ' + dates.returnDate);

	searchParams.push({
		leaveDate: dates.leaveDate,
		returnDate: dates.returnDate,
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

function getFlightDates() {
	var dateRangeStart = new Date();
	var dateRangeEnd = new Date(dateRangeStart.getTime() + 180 * DAY);

	var leaveDate = randomDate(dateRangeStart, dateRangeEnd);
	var returnDate = new Date(leaveDate.getTime() + 7 * DAY);

	return {
		leaveDate: leaveDate.toISOString().slice(0, 10),
		returnDate: returnDate.toISOString().slice(0, 10)
	};

}