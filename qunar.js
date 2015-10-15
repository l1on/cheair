var SITE = 'qunar';

var SEL = {
	FLIGHT_LEG: '.b_spc_list',
	PKG_LEG: '[id^=pkg]',
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

var casper = require('./lib/casperJsInit').run(SITE, { 
		eventsToScreenCapture: ['prices.loaded', 'prices.vendors.loaded']
	}
);

var numLoadingBookingPopups = 0;

casper.on('popup.created', function() {
	numLoadingBookingPopups++;
});

casper.on('popup.loaded', function(page) {
	this.echo(getUrlAfterCaptcha(page.url));

	if ((--numLoadingBookingPopups) === 0) {
		this.exit();
	}
});

casper.on('loaded', function() {
	this.waitWhileSelector(SEL.PRICE_LOADING_PROGRESS_BAR, function then() {
		this.emit('prices.loaded');
	});
});

casper.on('prices.loaded', function() {
	this.click(SEL.FULL_PRICE_BUTTON);    
	this.click(SEL.BOOKING_BUTTON);
	
	this.waitUntilVisible(SEL.FLIGHT_LEG, function then() {
		this.emit('prices.vendors.loaded');
	});
});

casper.on('prices.vendors.loaded', function() {
	var totalPrice = null;

	this.each(getLowestPricedVendorPerLeg(), function(self, vendor) {
		totalPrice += vendor.price;
		self.click(vendor.bookingButton);
	});

	this.echo(JSON.stringify({
		price: {
			from: SITE,
			value: totalPrice			
		}
	}));
});

var getUrlAfterCaptcha = function(url) {
	return url.match(/ret=(.+)/)[1];
}

var getLowestPricedVendorPerLeg = function() {
	return casper.evaluate(function(SEL) {
		var pkgFlightLegWithLowestPrice = $(SEL.FLIGHT_LEG).filter(SEL.PKG_LEG).has(SEL.LOWEST_PRICE);
		var flightLegsToAddup = pkgFlightLegWithLowestPrice.length > 0 ? pkgFlightLegWithLowestPrice : $(SEL.FLIGHT_LEG).not(SEL.PKG_LEG).has(SEL.LOWEST_PRICE);
		
		return flightLegsToAddup.map(function() {
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