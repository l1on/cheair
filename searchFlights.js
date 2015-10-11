var spawn = require('child_process').spawn,
    qunar = spawn('casperjs', ['qunar.js']),
    ta = spawn('casperjs', ['tripadvisor.js']);

qunar.stdout.on('data', function (data) {
  console.log('Qunar stdout: ' + data);
});

qunar.stderr.on('data', function (data) {
  console.log('Qunar stderr: ' + data);
});

qunar.on('close', function (code) {
  console.log('Qunar child process exited with code ' + code);
});

ta.stdout.on('data', function (data) {
  console.log('TA stdout: ' + data);
});

ta.stderr.on('data', function (data) {
  console.log('TA stderr: ' + data);
});

ta.on('close', function (code) {
  console.log('TA child process exited with code ' + code);
});