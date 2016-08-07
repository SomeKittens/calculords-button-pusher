'use strict';

let cards = [52,9,2,12,28,2];
let nums  = [6,5,9,1,7,8,6,5];
// let nums = [7,8,4,6,1,9,8,5,6];
// let cards = [12,18,54,10,11,17];

// let cards = [25];
// let nums = [3,6,1,3,1,4,9,6];

console.log('solving problem with n =', nums.length);
let solvs = require('./solver')(cards, nums);
let sorted = solvs.sort((a, b) => b.ints.length - a.ints.length);
console.log(`${sorted.length} Solutions found`);
console.log(`Best solution allows ${sorted[0].ints.length} card(s)`);

console.log(solvs.slice(0, 10));

process.on('message', deets => {
  console.log('got deets', deets);
  let solvs = require('./solver')(deets.cards, deets.nums);

  if (!solvs.length) {
    throw new Error('No solutions found!');
  }

  let sorted = solvs.sort((a, b) => b.ints.length - a.ints.length);
  console.log(`${sorted.length} Solutions found`);
  console.log(`Best solution allows ${sorted[0].ints.length} card(s)`);

  console.log(solvs);
  process.send(solvs[0]);
  process.exit(0);
});
