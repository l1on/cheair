var expect = require('chai').expect;
var SearchUrlGenerator = require('../lib/searchUrlGenerator');

describe('searchUrlGenerator', function() {
	var urlGen = new SearchUrlGenerator();

  	describe('#run()', function () {
  		var options;

  		context('when passed {site: "qunar"}', function() {
  			before(function() {
				options = {site: 'qunar'}
  			});

  			it('returns qunar specific url', function () {
      			expect(urlGen.run(options)).to.match(/^http:\/\/flight\.qunar\.com\/site\/interroundtrip_compare\.htm/);
    		});

    		context('when passed options contain {leaveDate: "2015-05-15", returnDate: "2016-12-01"}', function(){
    			before(function() {
    				options['leaveDate'] = '2015-05-15';
    				options['returnDate'] = "2016-12-01";
    			});

    			it('returns url with those two dates', function() {
    				expect(urlGen.run(options)).to.match(/fromDate=2015-05-15.+toDate=2016-12-01/);
    			});
    		})
  		});

   		context('when passed {site: "tripadvisor"}', function() {
    		before(function() {
				options = {site: 'tripadvisor'}
  			});
  			
  			it('returns tripadvisor specific url', function () {		
      			expect(urlGen.run(options)).to.match(/^http:\/\/flights\.tripadvisor\.com/);
    		});

    		context('when passed options contain {leaveDate: "2015-05-15", returnDate: "2016-12-01"}', function(){
    			before(function() {
    				options['leaveDate'] = '2015-05-15';
    				options['returnDate'] = "2016-12-01";
    			});

    			it('returns url with those two dates', function() {
    				expect(urlGen.run(options)).to.match(/date0=20150515.+date1=20161201/);
    			});
    		});

            context('when passed options contain {from: "Shanghai", to: "Bangkok"}', function(){
                before(function() {
                    options['from'] = 'Shanghai';
                    options['to'] = "Bangkok";
                });

                it('returns url with those two cities', function() {
                    var matches = [];

                    urlGen.run(options).forEach(function(url) {
                        matches.push(url.match(/airport0=PVG.+airport1=BKK|airport0=PVG.+airport1=DMK|airport0=SHA.+airport1=DMK|airport0=SHA.+airport1=BKK/)[0]);
                    });
    
                    expect(matches).to.have.members(['airport0=SHA&airport1=BKK', 'airport0=PVG&airport1=BKK', 'airport0=SHA&airport1=DMK', 'airport0=PVG&airport1=DMK']);
                });
            });
  		});

  	});
});