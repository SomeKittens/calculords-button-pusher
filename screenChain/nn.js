'use strict';

// Load stuff

// neural network lib
let synaptic = require('synaptic');

// Training data
let db = require('./data/trainingSet.json');

let shuffle = require('./util').shuffle;
let fs = require('fs');

// We have a TON of data, better to use only some of it
// Shuffle though to enusre we've got something of everything
let trainingDatas = shuffle(db.nums).slice(0, 100);
let inputNeurons = trainingDatas[0].input.length;

let Layer = synaptic.Layer;
let Network = synaptic.Network;
let Trainer = synaptic.Trainer;

// Fairly typical network construction
let inputLayer = new Layer(inputNeurons);
let hiddenLayer = new Layer(100);
let outputLayer = new Layer(10);

inputLayer.project(hiddenLayer);
hiddenLayer.project(outputLayer);

let myNetwork = new Network({
  input: inputLayer,
  hidden: [hiddenLayer],
  output: outputLayer
});


// Actually do the training
// https://github.com/cazala/synaptic/wiki/Trainer
let trainer = new Trainer(myNetwork);
trainer.train(trainingDatas, {
  rate: 0.1,
  iterations: 200,
  error: 0.001,
  shuffle: true,
  log: 1,
  cost: Trainer.cost.CROSS_ENTROPY
});
console.log('yey trained');

// Save first so if something goes wrong later we have the network
console.log('toJSON');
let netJSON = JSON.stringify(myNetwork.toJSON());

console.log('len', netJSON.length);
fs.writeFileSync('./data/network.json', netJSON);

console.log(`let's test it....`);
require('./nnTest')(myNetwork);

