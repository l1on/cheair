var spawn = require('child_process').spawn;
var _ = require('underscore');
var Url = require('url');
var UrlGenerator = require('./lib/searchUrlGenerator');

var options = {
    leaveDate: process.argv[2],//'2015-11-15',
    returnDate: process.argv[3],//'2015-12-01',
    from: process.argv[4],//'Shanghai',
    to: process.argv[5]//'Bangkok'	
};

var urlGen = new UrlGenerator();

var searchUrls = 
	urlGen.run(_.extend(_.clone(options), {site: 'tripadvisor'})).concat(
	urlGen.run(_.extend(_.clone(options), {site: 'qunar'})));

var flightSearchProcess = [];
var retrievedPrices = [];

_.each(searchUrls, function(url) {
	var searchProcess = spawn('casperjs', [Url.parse(url).hostname.replace(/.*\.(\w+)\.com/, '$1.js'), url]);
	
	flightSearchProcess.push(searchProcess);

	searchProcess.stdout.on('data', function (data) {
		//console.log('stdout: ' + data);	

		try {
			retrievedPrices.push(JSON.parse(data).price);
			process.emit('priceReceived');
		} catch(e) {}	
	});
});

process.on('priceReceived', function() {
	if (retrievedPrices.length == flightSearchProcess.length) {
		var taLowestPrice = _.chain(retrievedPrices).where({from: 'tripadvisor'}).min(function(price) {
			return price.value;
		}).value();

		console.log('taLowestPrice: ' + taLowestPrice.value);

		var qunarPrice = _.find(retrievedPrices, function(price) {
			return price.from == 'qunar';
		});

		console.log('qunarLowestPrice: ' + qunarPrice.value);

		var marginFromQunar = qunarPrice.value - taLowestPrice.value * 6.3;
	
		console.log('site to buy from: ' + (marginFromQunar > 0 ? 'tripadvisor' : 'qunar'));
		console.log('price difference: ' + Math.abs(marginFromQunar));
	}
});