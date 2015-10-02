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

var casper = require('casper').create({
	verbose: true,
    logLevel: "debug",
    waitTimeout: 1000 * 50,
	pageSettings: {
		userAgent: 'Chrome/44',
        loadImages: false,        
        loadPlugins: false
    },
});

var numLoadingBookingPopups = 0;

casper.each(EVENTS_TO_SCREEN_CAPTURE, function(self, event) {
	self.on(event, function() {
		this.capture('screenshots/' + event + '.png');
	});
});

casper.on('waitFor.timeout', function(timeout, details) {
	var incident = details.selector ? details.selector : details.testFx.name;
	this.capture('screenshots/qunar.timeout.' + incident + '.png');
});

casper.on('popup.created', function() {
	numLoadingBookingPopups++;
});

casper.on('popup.loaded', function(page) {
	this.echo(page.url);

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
	var vendors = getLowestPricedVendors();
	this.each(vendors, function(self, vendor) {
		self.echo(vendor.price);
		self.click('#' + vendor.bookingButtonId);
	});
});

var url = 'http://flight.qunar.com/site/interroundtrip_compare.htm?fromCity=%E4%B8%8A%E6%B5%B7&toCity=%E6%9B%BC%E8%B0%B7&fromDate=2015-10-14&toDate=2015-10-21&fromCode=SHA&toCode=BKK&from=fi_re_search&lowestPrice=null&isInter=true&favoriteKey=&showTotalPr=null';

casper.start(url, function then() {
	this.emit('qunar.loaded');
});

casper.run(function() {
	// this function is deliberately empty so that casper will keep running until an explicit call to exit()
});

var getLowestPricedVendors = function() {
	return casper.evaluate(function(SEL) {
		return $(SEL.FLIGHT_LEGS).has(SEL.LOWEST_PRICE).map(function() {
			var lowestPrice = Infinity;
			var bookingButtonId = null; 

			$(SEL.VENDOR_ROW, this).each(function() {
				var vendor = this;

				$(SEL.PRICE_LINE, vendor).each(function(index) {
					var ticketPrice = parseInt($(SEL.TICKET_PRICE, this).get(0).textContent);
					var tax = parseInt($(SEL.TICKET_TAX, this).get(0).textContent) || 0;

					if (ticketPrice + tax < lowestPrice) {
						lowestPrice = ticketPrice + tax;
						bookingButtonId = $(SEL.VENDOR_BOOKING_BUTTON, vendor).get(index).id;			
					}
				});
			});

			return {price: lowestPrice, bookingButtonId: bookingButtonId};
		}).get();
	}, SEL);
};