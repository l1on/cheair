var SITE = 'tripadvisor';

var SEL = {
	LOWEST_PRICE: '.first .price.chevron',
	PRICE_LOADING_PROGRESS_BAR: '.searchProgressBar',
	FLIGHT_LEGS: '.result_item',
	BOOKING_BUTTON: '.purchaseLink'
};

var casper = require('./lib/casperJsInit').run(SITE, { 
		eventsToScreenCapture: ['prices.loaded']
	}
);

casper.on('popup.loaded', function(page) {
	this.echo(page.url);
	this.exit();
});

casper.on('loaded', function() {
	this.waitWhileVisible(SEL.PRICE_LOADING_PROGRESS_BAR, function then() {
		this.emit('prices.loaded');
	});
});

casper.on('prices.loaded', function() {
	var vendor = getLowestPricedVendor();
	
	this.echo(JSON.stringify({
		price: {
			from: SITE,
			value: parseInt(/\d+/.exec(vendor.price)[0])
		}
	}));

	this.click(vendor.bookingButton);
});

var getLowestPricedVendor = function() {
	return casper.evaluate(function(SEL) {
		return {
			price: $(SEL.LOWEST_PRICE).get(0).textContent,
			bookingButton: '#' + $(SEL.LOWEST_PRICE).closest(SEL.FLIGHT_LEGS).attr('id') + ' ' + SEL.BOOKING_BUTTON
		};
	}, SEL);
};