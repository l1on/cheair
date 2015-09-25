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
	this.capture('qunar_timed_out.png');
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
    	this.echo(getLowestPrice(this));
    }, null, 20 * 1000);
});

var url = 'http://flight.qunar.com/site/interroundtrip_compare.htm?fromCity=%E4%B8%8A%E6%B5%B7&toCity=%E6%9B%BC%E8%B0%B7&fromDate=2015-10-01&toDate=2015-10-06&fromCode=SHA&toCode=BKK&from=qunarindex&lowestPrice=null&isInter=true&favoriteKey=&showTotalPr=null';

casper.start(url, function then() {
	this.emit('qunar.priceShown');
});

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
		var lowestPrice = Infinity;

		$('[id^=wrapper]', $(listSelector)).each(function() {
			$('.os_sv', $(this)).each(function() {
				var ticketPrice = parseInt($('.prc', this)[0].textContent);
				var tax = parseInt($('.r_txt', this)[0].textContent) || 0;
				
				if (ticketPrice + tax < lowestPrice) {
					lowestPrice = ticketPrice + tax;
				}
			});	
		});

		return lowestPrice;
	}, listSelector);
}