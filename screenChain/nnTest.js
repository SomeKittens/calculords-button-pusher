'use strict';

/**
 * Tests the integer network
 */

let synaptic = require('synaptic');
let db = require('./data/testSet.json');
let util = require('./util');
let softmax = util.softmax;
let shuffle = util.shuffle;
let getNum = util.getNumFromOutput(10);

let numbers = shuffle(db.nums);

let testNN = (network) => {
  let correct = 0;
  let correctByNum = [];
  numbers.forEach(dumm => {
    let is = getNum(softmax(network.activate(dumm.input)));
    let should = getNum(dumm.output);
    console.log('------');
    console.log('results:', should, is, should === is);
    if (!correctByNum[should]) {
      correctByNum[should] = {
        total: 0,
        correct: 0
      };
    }
    correctByNum[should].total++;
    if (should === is) {
      correct++;
      correctByNum[should].correct++;
    }
  });

  console.log(`Got ${correct} out of ${numbers.length} right (${(correct / numbers.length * 100).toLocaleString()}%)`);
  correctByNum.forEach((deetz, idx) => {
    console.log(`${idx}: Got ${deetz.correct} out of ${deetz.total} right (${(deetz.correct / deetz.total * 100).toLocaleString()}%)`);
  });
};

if (require.main === module) {
  let network = synaptic.Network.fromJSON(require('./data/intNetwork.json'));
  console.log('called directly');
  testNN(network);
} else {
  console.log('required as a module');
  module.exports = testNN;
}
