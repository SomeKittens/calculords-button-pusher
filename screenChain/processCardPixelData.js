'use strict';

/**
 * Converts the array representing the card data into something for the Card network
 */

let expect = require('chai').expect;

let possibleOutputs = [0,1,2,3,7,8,9,10,11,12,16,17,18,20,22,24,25,28,30,32,35,42,45,50,52,54,59,60,62,63,68,72,74,75];

let imgWidth = 48;
let imgHeight = 36;

let sliceWidth = 16;
let sliceHeight = 12;

function getNum(arr) {
  for(let i = 0; i < 100; i++) {
    if (arr[i]) {
      return possibleOutputs.findIndex(int => int === i);
    }
  }
}

// test data
let testArr0 = (new Array(100)).fill(0);
testArr0[0] = 1;
let testArr1 = (new Array(100)).fill(0);
testArr1[75] = 1;
let testArr2 = (new Array(100)).fill(0);
testArr2[35] = 1;

expect(getNum(testArr0)).to.eql(0);
expect(getNum(testArr1)).to.eql(33);
expect(getNum(testArr2)).to.eql(20);

/**
 * Our training data is much more than a vector of pixels this time
 * We have 25 different (overlapping) rectangles cut out of our image
 * This all needs to be represented as a single 1-dimensional array
 */

let horizontalStep = 8;
let verticalStep = 6;
let numHorizontalSlices = (imgWidth / sliceWidth) * 2 - 1;
let numVerticalSlices = (imgHeight / sliceHeight) * 2 - 1;
expect(numHorizontalSlices).to.eql(5);
expect(numVerticalSlices).to.eql(5);

/**
 * returns:
 * {
 *   input: int[], (all ints between 0 and 1)
 *   output: int[] (all zeros except for a single 1)
 * }
 */
module.exports = cardData => {
  return cardData.map(trainingInstance => {

    // trainingInstance.input is a 1-dimensional array of ints
    let inputsRaw = trainingInstance.input;
    let inputs = [];
    // This makes it easier for me to model in my head
    for (let i = 0; i < imgHeight; i++) {
      inputs.push(inputsRaw.slice((i * imgWidth), ((i+1) * imgWidth)));
    }

    expect(inputs.length).to.eql(imgHeight);

    inputs.forEach(row => expect(row.length).to.eql(imgWidth, 'Correct size of row'));

    let dataForNeurons = [];

    for (let i = 0; i < numHorizontalSlices; i++) {
      let sliceParams = [i * horizontalStep, i * horizontalStep + sliceWidth];
      for (let j = 0; j < numVerticalSlices; j++) {
        let slice = [];

        for (let k = 0; k < sliceHeight; k++) {
          slice.push(inputs[(j * verticalStep) + k].slice(...sliceParams));
        }
        expect(slice).to.be.an('array');
        expect(slice[0]).to.be.an('array');
        expect(slice.length).to.eql(sliceHeight);
        slice.forEach(row => expect(row.length).to.eql(sliceWidth));

        slice = slice.reduce((prev, cur) => prev.concat(cur));
        dataForNeurons.push(slice);
      }
    }

    // Ok, rewrite output
    let output = (new Array(possibleOutputs.length)).fill(0);
    // outNum is the *index* of our number in possibleOutputs
    let outNum = getNum(trainingInstance.output);
    if (outNum === undefined || outNum === -1) {
      console.log('New number in system, ignoring: ' + trainingInstance.output.indexOf(1));
      return false;
    }
    output[outNum] = 1;

    return {
      input: dataForNeurons.reduce((prev, cur) => prev.concat(cur)),
      output,
      _meta: trainingInstance._meta
    };
  })
  .filter(Boolean);
};


// expect(trainingDatas).to.be.an('array');
// trainingDatas.forEach(round => {
//   expect(round.input).to.be.an('array');
//   expect(round.input.length).to.eql(numInputNetworks * numInputNeurons);

//   expect(round.output).to.be.an('array');
//   expect(round.output.length).to.eql(possibleOutputs.length);
// });
