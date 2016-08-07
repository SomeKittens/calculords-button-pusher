'use strict';

/**
 * Runs the card network against test data
 */

let synaptic = require('synaptic');
let db = require('./data/testSet.json');
let util = require('./util');

let possibleOutputs = [0,1,2,3,7,8,9,10,11,12,16,17,18,20,22,24,25,28,30,32,35,42,45,50,52,54,59,60,62,63,68,72,74,75];
let gn = util.getNumFromOutput(possibleOutputs.length);
let getNum = output => possibleOutputs[gn(output)];

let testData = util.shuffle(db.cards);

let testNN = (network) => {
  let correct = 0;
  let correctByNum = [];
  testData.forEach(roundData => {
    let is = getNum(util.softmax(network.activate(roundData.input)));
    let should = getNum(roundData.output);
    console.log('------');
    console.log('should:', should, 'is:', is, 'match', should === is);
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

  console.log(`Got ${correct} out of ${testData.length} right (${(correct / testData.length * 100).toLocaleString()}%)`);
  correctByNum.forEach((deetz, idx) => {
    console.log(`${idx}: Got ${deetz.correct} out of ${deetz.total} right (${(deetz.correct / deetz.total * 100).toLocaleString()}%)`);
  });
};

if (require.main === module) {
  let network = synaptic.Network.fromJSON(require('./data/cardNetwork.json'));
  console.log('called directly');
  testNN(network);
} else {
  console.log('required as a module');
  module.exports = testNN;
}
