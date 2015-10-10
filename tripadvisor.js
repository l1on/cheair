var SEL = {
	LOWEST_PRICE: '.first .price.chevron',
	PRICE_LOADING_PROGRESS_BAR: '.searchProgressBar',
	FLIGHT_LEGS: '.result_item',
	BOOKING_BUTTON: '.purchaseLink'
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
    viewportSize: {width: 800, height: 600},
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

casper.on('popup.loaded', function(page) {
	this.echo(page.url);
	this.exit();
});

casper.on('tripadvisor.loaded', function() {
	this.waitWhileVisible(SEL.PRICE_LOADING_PROGRESS_BAR, function then() {
		this.emit('tripadvisor.prices.loaded');
	});
});

casper.on('tripadvisor.prices.loaded', function() {
	var vendor = getLowestPricedVendor();
	
	this.echo(vendor.price);
	this.click(vendor.bookingButton);
});

casper.start(url, function then() {
	this.emit('tripadvisor.loaded');
});

casper.run(function() {});

var getLowestPricedVendor = function() {
	return casper.evaluate(function(SEL) {
		return {
			price: $(SEL.LOWEST_PRICE).get(0).textContent,
			bookingButton: '#' + $(SEL.LOWEST_PRICE).closest(SEL.FLIGHT_LEGS).attr('id') + ' ' + SEL.BOOKING_BUTTON
		};
	}, SEL);
};