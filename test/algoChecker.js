'use strict';

let expect = require('chai').expect;
let slow = require('./calculords');
let test= require('./newCalcSolver');

let cheapTest = {
  data: {
    cards: [2],
    nums: [1,1]
  }
};

let bigTest = {
  data: {
   cards: [52,9,2,12,28, 2],
   nums: [6, 5, 9, 1, 7, 8, 6, 5]
  }
};

console.log('------ running classic thinger ------');
let slowResult = slow(bigTest);
console.log(slowResult);

console.log('------ running newfangled thinger ------');
let fastResult = test(bigTest);

expect(fastResult).to.deep.equal(slowResult);
