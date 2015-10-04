var SEL = {
};

var EVENTS_TO_SCREEN_CAPTURE = [
	'tripadvisor.loaded', 
	'tripadvisor.prices.loaded'
];

var url = 'http://flights.tripadvisor.com/en_US?geo=293916&ipGeo=191&ipCountry=US&travelers=1&cos=0&tab=default&dregion=293915&oregion=294211&itin=0&abc=47&nonstop=no&sub=false&client=tripadvisor-cpm4&channel=flights&airport0=PVG&airport1=BKK&date0=20151114&date1=20151121&time0=anytime&time1=anytime&nearby0=false&nearby1=false&cr=0&m=&slice=single_12&cms=none&entry=false&showAwSignup=true&fdrs=22&isp=AS7203';

var casper = require('casper').create({
	verbose: true,
    logLevel: "debug",
    waitTimeout: 1000 * 40,
	pageSettings: {
		userAgent: 'Chrome/45',
        loadImages: false,        
        loadPlugins: false
    },
});

casper.each(EVENTS_TO_SCREEN_CAPTURE, function(self, event) {
	self.on(event, function() {
		this.capture('screenshots/' + event + '.png');
	});
});

casper.on('waitFor.timeout', function(timeout, details) {
	var incident = null;

	if (details.selector) {
		incident = details.selector;
	} else if (details.testFx) {
		incident = details.testFx.name;
	} else if (details.visible) {
		incident = details.visible;
	}

	this.capture('screenshots/tripadvisor.timeout.' + incident + '.png');
});

casper.on('tripadvisor.loaded', function() {
	this.waitWhileVisible('.searchProgressBar', function then() {
		this.emit('tripadvisor.prices.loaded');
	});
});

casper.on('tripadvisor.prices.loaded', function() {
	var vendors = getLowestPricedVendors();
	
	this.each(vendors, function(self, vendor) {
		self.echo(vendor.price);
		self.echo(vendor.bookingButton);
	});
});

casper.start(url, function then() {
	this.emit('tripadvisor.loaded');
});

casper.run();

var getLowestPricedVendors = function() {
	return casper.evaluate(function(SEL) {
		return $('.first .price.chevron').map(function() {
			return {
				price: this.textContent,
				bookingButton: '#' + $(this).closest('.result_item').attr('id') + ' .purchaseLink'
			};
		}).get();
	}, SEL);
};