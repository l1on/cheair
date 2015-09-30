var SELECTORS = {
	FLIGHT_LEGS: '.b_spc_list',
	LOWEST_PRICE: '.low_pr'

};

var casper = require('casper').create({
	verbose: true,
    logLevel: "debug",
    waitTimeout: 1000 * 40,
	pageSettings: {
		userAgent: 'Chrome/44',
        loadImages: false,        
        loadPlugins: false
    },
});

casper.on('waitFor.timeout', function(timeout, details) {
	var incident = details.selector ? details.selector : details.testFx.name;
	this.capture('screenshots/qunar_timeout_on_' + incident + '.png');
});

casper.on('qunar.loaded', function() {
	this.capture('screenshots/qunar_loaded.png');

	casper.waitWhileSelector('.m-loader-inner[style*=overflow]', function then() {
		this.emit('qunar.prices.loaded');
	});
});

casper.on('qunar.prices.loaded', function() {
	this.capture('screenshots/qunar_prices_loaded.png');
	
	this.waitUntilVisible('#filter_showAllprice_yes', function then() {
		this.emit('qunar.button.totalPrice.loaded');

	    this.click('#filter_showAllprice_yes');    
	    this.click('.btn_book');
	    this.emit('qunar.button.booking.first.clicked');		
	});
});

casper.on('qunar.button.totalPrice.loaded', function() {
	this.capture('screenshots/qunar.button.totalPrice.loaded.png');

	this.click('#filter_showAllprice_yes');    
	this.click('.btn_book');
	this.waitWhileVisible('.qvt_loadding', function then() {
		this.emit('qunar.prices.vendors.loaded');
	});
});

casper.on('qunar.prices.vendors.loaded', function() {
	this.capture('screenshots/qunar.prices.vendors.loaded.png');
	var vendors = getLowestPricedVendors();
   	debugger
});

var url = 'http://flight.qunar.com/site/interroundtrip_compare.htm?fromCity=%E4%B8%8A%E6%B5%B7&toCity=%E6%9B%BC%E8%B0%B7&fromDate=2015-12-15&toDate=2015-12-22&fromCode=SHA&toCode=BKK&from=qunarindex&lowestPrice=null&isInter=true&favoriteKey=&showTotalPr=null';

casper.start(url, function then() {
	this.emit('qunar.loaded');
});

casper.run();

var getLowestPricedVendors = function() {
	return casper.evaluate(function() {
		//return $('.b_spc_list').has('.low_pr').map(function() {
			return {
				price: 100,
				bookingButton: 'button'
			};
		//}).get();
		//return 3;
	});
	//return 3;
};

/*var getLowestPrice = function(casper) {
	if (casper.exists('[id^=pkg_wrlist] .prc.low_pr')) {
		return getLowestPriceInList(casper, '[id^=pkg_wrlist]');
	} else if (casper.exists('[id^=transfer_wrlist] .prc.low_pr')) {
		var pkgPrice1st = getLowestPriceInList(casper, '[id^=transfer_wrlist]');

	} else {
		var outPrice = getLowestPriceInList(casper, '[id^=out_wrlist]');
		var retPrice = getLowestPriceInList(casper, '[id^=ret_wrlist]');
		
		return {
			value: outPrice.value + retPrice.value,
			buttons: [outPrice.button, retPrice.button]
		};
	}


}

var getLowestPriceInList = function(casper, listSelector) {
	return casper.evaluate(function(listSelector) {
		var lowestPrice = {value: Infinity};

		$('[id^=wrapper]', $(listSelector)).each(function() {
			var vendor = this;
			$('.os_sv', vendor).each(function(index) {
				var ticketPrice = parseInt($('.prc', this)[0].textContent);
				var tax = parseInt($('.r_txt', this)[0].textContent) || 0;
				
				if (ticketPrice + tax < lowestPrice.value) {
					lowestPrice.value = ticketPrice + tax;
					lowestPrice.button = $('.btn_book_org', vendor)[index];			
				}
			});
		});

		return lowestPrice;
	}, listSelector);
}*/