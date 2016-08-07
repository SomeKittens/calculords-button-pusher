'use strict';

let cards = [52,9,2,12,28,2];
let nums  = [6,5,9,1,7,8,6,5];

let fork = require('child_process').fork;

let y = fork(__dirname + '/run.js');

y.on('message', (m) => console.log('mess', m));
y.on('exit', code => {
  console.log('exited with code', code)
  process.exit(code);
});

y.send({
  cards, nums
});
