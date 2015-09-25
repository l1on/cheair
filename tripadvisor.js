var casper = require('casper').create({
	verbose: true,
    logLevel: "debug",
	pageSettings: {
		userAgent: 'Chrome/44',
        loadImages: false,        
        loadPlugins: false
    },
});

casper.on('waitFor.timeout', function() {
	this.capture('tripadvisor_timed_out.png');
});

casper.on('tripadvisor.priceShown', function() {
	this.echo(getLowestPrice(this));
});

var url = 'http://flights.tripadvisor.com/CheapFlights?cr=0&airport0=PVG&airport1=BKK&date0=20151001&date1=20151006&time0=anytime&time1=anytime&nearby0=no&nearby1=no&pax0=a&travelers=1&cos=0&nonstop=no&lowestFareCurrency=USD&callback=doNothing';

casper.start(url, function then() {
	this.waitWhileVisible('.searchProgressBar', function then() {
		this.emit('tripadvisor.priceShown');
	}, null, 20 * 1000);
});

casper.run();

var getLowestPrice = function(casper) {
	return casper.fetchText('.first .price.chevron');
}