var require = patchRequire(require);

exports.run = function (site, options) {
	var TIMEOUT_IN_SEC = 90;

	var options = options || {};
	options.eventsToScreenCapture = options.eventsToScreenCapture ? options.eventsToScreenCapture.concat(['loaded']) : ['loaded'];

	var casper = require('casper').create({
		verbose: true,
	    logLevel: "debug",
	    waitTimeout: 1000 * TIMEOUT_IN_SEC + 1,
	    timeout: 1000 * TIMEOUT_IN_SEC, 
	    viewportSize: {width: 800, height: 600},
		pageSettings: {
			userAgent: 'Chrome/45',
	        loadImages: false,        
	        loadPlugins: false
	    },
	    onTimeout: null
	});

	casper.each(options.eventsToScreenCapture, function(self, event) {
		self.on(event, function() {
			this.capture('screenshots/' + site + '.' + event + '.png');
		});
	});

	casper.on('timeout', function() {
		this.reload(function then() {
			this.emit('loaded');
		});

		setTimeout(function(self){
			self.capture('screenshots/' + site + '.timeout.png');
			self.die("Script timeout after 2 attempts to finish, exiting.");
		}, 1000 * TIMEOUT_IN_SEC, this);
	});

	casper.start(casper.cli.get(0), function then() {
		this.emit('loaded');
	});

	casper.run(function() {});

	return casper;
};