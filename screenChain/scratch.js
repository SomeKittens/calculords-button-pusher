'use strict';

/**
 * I just use this to run quick scripts
 */

let synaptic = require('synaptic');
let trainingDB = require('./data/trainingSet.json');
let testDB = require('./data/testSet.json');
let fs = require('fs');
let expect = require('chai').expect;

let possibleOutputs = [0,1,2,3,7,8,9,10,11,12,16,17,18,20,22,24,25,28,30,32,35,42,45,50,52,54,59,60,62,63,68,72,74,75];

let thingers = {};


function getNum(arr) {
  for(let i = 0; i < possibleOutputs.length; i++) {
    if (arr[i]) {
      return possibleOutputs[i];
    }
  }
}

let calc = (name, db) => {
  db.cards.forEach(card => {
    let n = getNum(card.output);
    // if (n === undefined) {
    //   console.log(card.output);
    // }
    if (!thingers[n]) {
      thingers[n] = {
        total: 0
      };
    }
    if (!thingers[n][name]) {
      thingers[n][name] = 0;
    }
    thingers[n][name]++;
    thingers[n].total++;
  });
};

calc('training', trainingDB);
calc('test', testDB);
console.log(thingers);

console.log(Object.keys(thingers).map(key => {
  let item = thingers[key];
  item.num = +key;
  return item;
})
.sort((a,b) => a.total - b.total)
);

// console.log(Object.keys(thingers).map(key => {
//   let item = thingers[key];
//   item.num = +key;
//   return item;
// }).filter(a => a.total < 20));





// let asdfDB = require('../db.json');

// asdfDB.forEach(item => {
//   try {
//     require('fs').readFileSync(`../public/screens/${item.filename}.png`);
//   } catch (e) {
//     console.log(item.filename);
//   }
// });








// let numInputNetworks = 3;
// let numInputNeurons = 2 * 2;

// let Layer = synaptic.Layer;
// let Network = synaptic.Network;
// let Neuron = synaptic.Neuron;
// let Trainer = synaptic.Trainer;

// // let finalOutputLayer = new Layer(possibleOutputs.length);

// let hiddenLayerArr = [];
// let neuronArr = [];

// for (let i = 0; i < numInputNetworks; i++) {
//   console.log(i);
//   let output = new Neuron();
//   for (let j = 0; j < numInputNeurons; j++) {
//     console.log(j);
//     let n = new Neuron();
//     n.project(output);
//     neuronArr.push(n);
//   }
//   hiddenLayerArr.push(output);
//   // let input = new Layer(neuronArr);

//   // input.project(output);

//   // let net = new Network({
//   //   input,
//   //   output
//   // });
// }

// let randomInputVals = (new Array(numInputNeurons * numInputNetworks)).fill(0).map(() => Math.random());

// assert(neuronArr.length === numInputNeurons * numInputNetworks);

// let inputLayer = new Layer();
// inputLayer.list = neuronArr;
// inputLayer.size = neuronArr.length;
// let outputLayer = new Layer();
// outputLayer.list = hiddenLayerArr;
// outputLayer.size = hiddenLayerArr.length;

// inputLayer.activate(randomInputVals);
// let hopefullythisWorks = outputLayer.activate();
// console.log(hopefullythisWorks);

// let network = new Network({
//   input: inputLayer,
//   output: outputLayer
// });

// console.log(network.neurons());

// assert(network.neurons().length === numInputNeurons * numInputNetworks + numInputNetworks);

// console.log(network.toJSON());

// let Trainer = synaptic.Trainer;

// for (let i = 0; i < numInputNetworks; i++) {
//   let input = new Layer(numInputNeurons);
//   let output = new Layer(1);

//   input.project(output);

//   let net = new Network({
//     input,
//     output
//   });
// }


// console.log(`let's test it....`);
// require('./nnTest')(myNetwork);

// console.log('toJSON');
// let netJSON = JSON.stringify(myNetwork.toJSON());

// console.log('len', netJSON.length);
// fs.writeFileSync('./data/network.json', netJSON);





// let Bluebird = require('bluebird');
// let fs = Bluebird.promisifyAll(require('fs'));
// let db = require('./data/db-training.json');

// let screenshot = require('./screenshot');
// let greyify = require('./greyify');
// let slice = require('./slice');
// let split = require('./split');
// let parsePix = require('./parsePix');


// let cardFiles = fs.readdirAsync('./imgs');

// // cardFiles
// // .then(fileList =>
// //   fileList.map(fileName => +fileName.split('-')[0])
// // )
// // .then(numz => {
// //   let s = new Set(numz);
// //   console.log(s.size);
// // });


// let i = 0;
// function parseImage(entry) {
//   console.log('processing', i);
//   return greyify(entry)
//   .then(grey => {
//     return Bluebird.props({
//       cards: Bluebird.all(split('cards', entry, grey)),
//       nums: Bluebird.all(split('nums', entry, grey))
//     });
//   })
//   .then(promises => {
//     console.log('--- slicing---');
//     return Bluebird.props({
//       cards: Bluebird.map(promises.cards, slice),
//       nums: Bluebird.map(promises.nums, slice)
//     });
//   })
//   .then(slices => {
//     console.log('--- pixel parsing ---');
//     slices.cards.forEach(s => {
//       fs.writeFileAsync('./imgs/' + [s.value, s.i, s.j, entry.filename, Math.random().toString().slice(2)].join('-') + '.png', s.buffer);
//     });
//     i++;
//     return Bluebird.props({
//       cards: Bluebird.map(slices.cards, parsePix),
//       nums: Bluebird.map(slices.nums, parsePix)
//     });
//   });
// }

// let itemsWithFile = db.map(item => {
//   item.screenBuf = fs.readFileSync(`../public/screens/${item.filename}.png`);
//   return item;
// });

// Bluebird.mapSeries(itemsWithFile, parseImage)
// .then(trainingData => {
//   console.log('--- saving ---');
//   let formattedData = {
//     cards: trainingData.map(item => item.cards).reduce((prev, item) => prev.concat(item)),
//     nums: trainingData.map(item => item.nums).reduce((prev, item) => prev.concat(item))
//   };
//   // console.log(formattedData.nums);
//   // return fs.writeFileAsync('./trainingSet.json', JSON.stringify(formattedData));
// })
// .catch(err => console.log(err.message));

// // Bluebird.mapSeries(itemsWithFile, parseImage)
// // .then(trainingData => {
// //   console.log('--- saving ---');
// //   let formattedData = {
// //     cards: trainingData.map(item => item.cards).reduce((prev, item) => prev.concat(item)),
// //     nums: trainingData.map(item => item.nums).reduce((prev, item) => prev.concat(item))
// //   };
// //   console.log(formattedData.nums);
// //   return fs.writeFileAsync('./trainingSet.json', JSON.stringify(formattedData));
// // })
// // .catch(err => console.log(err.message));
