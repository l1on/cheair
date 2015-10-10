var _ = require('underscore');

var SearchUrlGenerator = function (argument) {
	this.airportsCities = _.values(require('../data/airports_cities'));
};

SearchUrlGenerator.prototype.run = function(options) {
	if (options.site == 'qunar') {
		return 'http://flight.qunar.com/site/interroundtrip_compare.htm?fromCity=' + options.from + '&toCity=' + options.to + '&fromDate=' + options.leaveDate + '&toDate=' + options.returnDate + '&from=fi_re_search&lowestPrice=null&isInter=true&favoriteKey=&showTotalPr=null';
	} else {
		var urls = [];

		_.chain(this.airportsCities).where({city: options.from}).each(function(fromAirport) {	
			_.chain(this.airportsCities).where({city: options.to}).each(function(toAirport) {
				urls.push('http://flights.tripadvisor.com/en_US?geo=293916&ipGeo=191&ipCountry=US&travelers=1&cos=0&tab=default&dregion=293915&oregion=294211&itin=0&abc=47&nonstop=no&sub=false&client=tripadvisor-cpm4&channel=flights&airport0=' + fromAirport.iata + '&airport1=' + toAirport.iata + '&date0=' + options.leaveDate.replace(/-/g, '') + '&date1=' + options.returnDate.replace(/-/g, '') + '&time0=anytime&time1=anytime&nearby0=false&nearby1=false&cr=0&m=&slice=single_12&cms=none&entry=false&showAwSignup=true&fdrs=22&isp=AS7203');
			});
		}, this);

		return urls;	
	}
};

module.exports = SearchUrlGenerator;