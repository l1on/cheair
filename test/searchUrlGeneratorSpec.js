var assert = require("assert");
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
      			assert.notEqual(null, urlGen.run(options).match(/^http:\/\/flight\.qunar\.com\/site\/interroundtrip_compare\.htm/));
    		});

    		context('when passed options contain {leaveDate: "2015-05-15", returnDate: "2016-12-01"}', function(){
    			before(function() {
    				options['leaveDate'] = '2015-05-15';
    				options['returnDate'] = "2016-12-01";
    			});

    			it('returns url with those two dates', function() {
    				assert.notEqual(null, urlGen.run(options).match(/fromDate=2015-05-15.+toDate=2016-12-01/));
    			});
    		})
  		});

   		context('when passed {site: "tripadvisor"}', function() {
    		before(function() {
				options = {site: 'tripadvisor'}
  			});
  			
  			it('returns tripadvisor specific url', function () {		
      			assert.notEqual(null, urlGen.run(options).match(/^http:\/\/flights\.tripadvisor\.com/));
    		});

    		context('when passed options contain {leaveDate: "2015-05-15", returnDate: "2016-12-01"}', function(){
    			before(function() {
    				options['leaveDate'] = '2015-05-15';
    				options['returnDate'] = "2016-12-01";
    			});

    			it('returns url with those two dates', function() {
    				debugger
    				assert.notEqual(null, urlGen.run(options).match(/date0=20150515.+date1=20161201/));
    			});
    		})
  		});

  	});
});