var SEL = {
	FLIGHT_LEGS: '.b_spc_list',
	LOWEST_PRICE: '.prc.low_pr',
	FULL_PRICE_BUTTON: '#filter_showAllprice_yes',
	BOOKING_BUTTON: '.btn_book',
	PRICE_LOADING_PROGRESS_BAR: '.m-loader-inner[style*=overflow]',
	VENDOR_ROW: '[rel=vendor]',
	PRICE_LINE: '.os_sv',
	VENDOR_BOOKING_BUTTON: '.btn_book_org',
	TICKET_PRICE: '.prc',
	TICKET_TAX: '.r_txt'
};

var EVENTS_TO_SCREEN_CAPTURE = [
	'qunar.loaded', 
	'qunar.prices.loaded',
	'qunar.prices.vendors.loaded'
];

var numLoadingBookingPopups = 0;

var url = 'http://flight.qunar.com/site/interroundtrip_compare.htm?fromCity=shanghai&toCity=bangkok&fromDate=2015-11-14&toDate=2015-11-21&from=fi_re_search&lowestPrice=null&isInter=true&favoriteKey=&showTotalPr=null';

var casper = require('casper').create({
	verbose: true,
    logLevel: "debug",
    waitTimeout: 1000 * 50,
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

	this.capture('screenshots/qunar.timeout.' + incident + '.png');
});

casper.on('popup.created', function() {
	numLoadingBookingPopups++;
});

casper.on('popup.loaded', function(page) {
	this.echo(getUrlAfterCaptcha(page.url));

	if ((--numLoadingBookingPopups) === 0) {
		this.exit();
	}
});

casper.on('qunar.loaded', function() {
	this.waitWhileSelector(SEL.PRICE_LOADING_PROGRESS_BAR, function then() {
		this.emit('qunar.prices.loaded');
	});
});

casper.on('qunar.prices.loaded', function() {
	this.click(SEL.FULL_PRICE_BUTTON);    
	this.click(SEL.BOOKING_BUTTON);
	
	this.waitUntilVisible(SEL.FLIGHT_LEGS, function then() {
		this.emit('qunar.prices.vendors.loaded');
	});
});

casper.on('qunar.prices.vendors.loaded', function() {
	var totalPrice = null;

	this.each(getLowestPricedVendorPerLeg(), function(self, vendor) {
		totalPrice += vendor.price;
		self.click(vendor.bookingButton);
	});

	this.echo(totalPrice);
});

casper.start(url, function then() {
	this.emit('qunar.loaded');
});

casper.run(function() {
	// this function is deliberately empty so that casper will keep running until an explicit call to exit()
});

var getUrlAfterCaptcha = function(url) {
	return url.match(/ret=(.+)/)[1];
}

var getLowestPricedVendorPerLeg = function() {
	return casper.evaluate(function(SEL) {
		return $(SEL.FLIGHT_LEGS).has(SEL.LOWEST_PRICE).map(function() {
			var lowestPricedVendor = {
				price: Infinity,
				bookingButton: null
			};

			$(SEL.VENDOR_ROW, this).each(function() {
				var vendor = this;

				$(SEL.PRICE_LINE, vendor).each(function(index) {
					var ticketPrice = parseInt($(SEL.TICKET_PRICE, this).get(0).textContent);
					var tax = parseInt($(SEL.TICKET_TAX, this).get(0).textContent) || 0;

					if (ticketPrice + tax < lowestPricedVendor.price) {
						lowestPricedVendor.price = ticketPrice + tax;
						lowestPricedVendor.bookingButton = '#' + $(SEL.VENDOR_BOOKING_BUTTON, vendor).get(index).id;			
					}
				});
			});

			return lowestPricedVendor;
		}).get();
	}, SEL);
};