var SEL = {
	FLIGHT_LEGS: '.b_spc_list',
	LOWEST_PRICE: '.low_pr',
	FULL_PRICE_BUTTON: '#filter_showAllprice_yes',
	BOOKING_BUTTON: '.btn_book',
	PRICE_LOADING_PROGRESS_BAR: '.m-loader-inner[style*=overflow]'
};

var EVENTS_TO_SCREEN_CAPTURE = [
	'qunar.loaded', 
	'qunar.prices.loaded',
	'qunar.button.fullPrice.loaded',
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

casper.each(EVENTS_TO_SCREEN_CAPTURE, function(self, event) {
	self.on(event, function() {
		this.capture('screenshots/' + event + '.png');
	});
});

casper.on('waitFor.timeout', function(timeout, details) {
	var incident = details.selector ? details.selector : details.testFx.name;
	this.capture('screenshots/qunar.timeout.' + incident + '.png');
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
	this.each(getLowestPricedVendors(), function(self, vendor) {
		self.echo(vendor.price);
		self.echo(vendor.bookingButtonId);
	});
});

var url = 'http://flight.qunar.com/site/interroundtrip_compare.htm?fromCity=%E4%B8%8A%E6%B5%B7&toCity=%E6%9B%BC%E8%B0%B7&fromDate=2015-10-01&toDate=2015-10-06&fromCode=SHA&toCode=BKK&from=qunarindex&lowestPrice=null&isInter=true&favoriteKey=&showTotalPr=null';

casper.start(url, function then() {
	this.emit('qunar.loaded');
});

casper.run();

var getLowestPricedVendors = function() {
	return casper.evaluate(function(SEL) {
		return $(SEL.FLIGHT_LEGS).has(SEL.LOWEST_PRICE).map(function() {
			var lowestPrice = Infinity;
			var bookingButtonId = null; 

			$('[rel=vendor]', this).each(function() {
				var vendor = this;

				$('.os_sv', vendor).each(function(index) {
					var ticketPrice = parseInt($('.prc', this)[0].textContent);
					var tax = parseInt($('.r_txt', this)[0].textContent) || 0;

					if (ticketPrice + tax < lowestPrice) {
						lowestPrice = ticketPrice + tax;
						bookingButtonId = $('.btn_book_org', vendor).get(index).id;			
					}
				});
			});

			return {price: lowestPrice, bookingButtonId: bookingButtonId};
		}).get();
	}, SEL);
};