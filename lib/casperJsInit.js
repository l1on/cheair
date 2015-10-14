var require = patchRequire(require);

exports.run = function (site, options) {
	var options = options || {};
	options.eventsToScreenCapture = options.eventsToScreenCapture ? options.eventsToScreenCapture.concat(['loaded']) : ['loaded'];

	var casper = require('casper').create({
		verbose: true,
	    logLevel: "debug",
	    waitTimeout: 1000 * 50,
	    viewportSize: {width: 800, height: 600},
		pageSettings: {
			userAgent: 'Chrome/45',
	        loadImages: false,        
	        loadPlugins: false
	    },
	});

	casper.each(options.eventsToScreenCapture, function(self, event) {
		self.on(event, function() {
			this.capture('screenshots/' + site + '.' + event + '.png');
		});
	});

	casper.on('waitFor.timeout', function(timeout, details) {
		var incident = null;

		if (details.selector) {
			incident = details.selector;
		} else if (details.testFx) {
			incident = details.testFx.name;
		} else if (details.visible) {
			incident = details.visible;
		}

		this.capture('screenshots/' + site + '.timeout.' + incident + '.png');
	});

	casper.start(casper.cli.get(0), function then() {
		this.emit('loaded');
	});

	casper.run(function() {});

	return casper;
};