'use strict';

let synaptic = require('synaptic');
let db = require('./data/trainingSet.json');
let fs = require('fs');
let shuffle = require('./util').shuffle;

let trainingDatas = shuffle(db.nums).slice(0, 100);
let inputNeurons = trainingDatas[0].input.length;

let Layer = synaptic.Layer;
let Network = synaptic.Network;
let Trainer = synaptic.Trainer;

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

console.log('toJSON');
let netJSON = JSON.stringify(myNetwork.toJSON());

console.log('len', netJSON.length);
fs.writeFileSync('./data/network.json', netJSON);

console.log(`let's test it....`);
require('./nnTest')(myNetwork);

