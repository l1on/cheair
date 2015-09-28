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
	this.capture('screenshots/qunar_waitFor_timeout.png');
});

casper.on('qunar.priceShown', function() {
	this.waitUntilVisible('#filter_showAllprice_yes', function then() {
	    this.click('#filter_showAllprice_yes');
	    
	    this.click('.btn_book');
	    this.emit('qunar.button.booking.first.clicked');		
	});
});

casper.on('qunar.button.booking.first.clicked', function() {
	this.waitWhileVisible('.qvt_loadding', function then() {
		var price = getLowestPrice(this);
    	this.echo(price.value);
  
    	this.click('#' + price.button.id);
    	this.capture('screenshots/qunar_button_booking_lowest_price_clicked.png')
    }, null, 20 * 1000);
});

var url = 'http://flight.qunar.com/site/interroundtrip_compare.htm?fromCity=%E4%B8%8A%E6%B5%B7&toCity=%E6%9B%BC%E8%B0%B7&fromDate=2015-10-01&toDate=2015-10-06&fromCode=SHA&toCode=BKK&from=qunarindex&lowestPrice=null&isInter=true&favoriteKey=&showTotalPr=null';

casper.start(url, function then() {
	casper.waitFor(function check() {
		return this.evaluate(function() {
        	return $('.m-loader-inner').width() > 300;
    	});		
	}, function then() {
		this.emit('qunar.priceShown');
	});
});

casper.page.onCallback = function(data) {
	return casper.click;
}

casper.run();

var getLowestPrice = function(casper) {
	if (casper.exists('[id^=pkg_wrlist] .prc.low_pr')) {
		return getLowestPriceInList(casper, '[id^=pkg_wrlist]');
	} else {
		return getLowestPriceInList(casper, '[id^=out_wrlist]') + getLowestPriceInList(casper, '[id^=ret_wrlist]');
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
}