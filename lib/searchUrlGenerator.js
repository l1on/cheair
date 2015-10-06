var SearchUrlGenerator = function (argument) {
	// body...
};

SearchUrlGenerator.prototype.run = function(options) {
	if (options.site == 'qunar') {
		return 'http://flight.qunar.com/site/interroundtrip_compare.htm?fromCity=%E4%B8%8A%E6%B5%B7&toCity=%E6%9B%BC%E8%B0%B7&fromDate=' + options.leaveDate + '&toDate=' + options.returnDate + '&fromCode=SHA&toCode=BKK&from=fi_re_search&lowestPrice=null&isInter=true&favoriteKey=&showTotalPr=null';
	} else {
		var leaveDate = options.leaveDate || '';
		var returnDate = options.returnDate || '';
		
		return 'http://flights.tripadvisor.com/en_US?geo=293916&ipGeo=191&ipCountry=US&travelers=1&cos=0&tab=default&dregion=293915&oregion=294211&itin=0&abc=47&nonstop=no&sub=false&client=tripadvisor-cpm4&channel=flights&airport0=PVG&airport1=BKK&date0=' + leaveDate.replace(/-/g, '') + '&date1=' + returnDate.replace(/-/g, '') + '&time0=anytime&time1=anytime&nearby0=false&nearby1=false&cr=0&m=&slice=single_12&cms=none&entry=false&showAwSignup=true&fdrs=22&isp=AS7203';
	}
};

module.exports = SearchUrlGenerator;