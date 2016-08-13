'use strict';

// Package imports, blah blah

// Lib for neural networking
let synaptic = require('synaptic');
// training data
let db = require('./data/trainingSet.json');
let fs = require('fs');
let expect = require('chai').expect;

let Layer = synaptic.Layer;
let Network = synaptic.Network;
let Neuron = synaptic.Neuron;
let Trainer = synaptic.Trainer;

// Our deck doesn't contain all numbers in [0, 99]
let possibleOutputs = [0,1,2,3,7,8,9,10,11,12,16,17,18,20,22,24,25,28,30,32,35,42,45,50,52,54,59,60,62,63,68,72,74,75];

// Adjust as needed, mine is 48x36
let desiredSlicesPerSide = 5;

// 48 / desiredSlicesPerSide
let sliceWidth = 16;
// 36 / desiredSlicesPerSide
let sliceHeight = 12;

let numInputNetworks = Math.pow(desiredSlicesPerSide, 2);
let numInputNeurons = sliceWidth * sliceHeight;

let hiddenLayerArr = [];
let neuronArr = [];

let trainingDatas = db.cards;

// Build our first two layers
// Synaptic makes this hard
// We need to build an array of neurons, make our connections as needed,
// then mock out a Layer to use that array
for (let i = 0; i < numInputNetworks; i++) {
  let output = [new Neuron(), new Neuron(), new Neuron()];
  for (let j = 0; j < numInputNeurons; j++) {
    let n = new Neuron();
    output.forEach(o => n.project(o));
    neuronArr.push(n);
  }
  hiddenLayerArr = hiddenLayerArr.concat(output);
}

// This sort of thing takes some time and errors may not be found until the end
// I like to use expect here to catch my assumptions beforehand
expect(neuronArr.length).to.eql(numInputNetworks * numInputNeurons);
expect(hiddenLayerArr.length).to.eql(numInputNetworks * 3);

// Create empty layers, fill 'em with our neuron arrays
let inputLayer = new Layer();
inputLayer.list = neuronArr;
inputLayer.size = neuronArr.length;

let hiddenLayer = new Layer();
hiddenLayer.list = hiddenLayerArr;
hiddenLayer.size = hiddenLayerArr.length;

let outputLayer = new Layer(possibleOutputs.length);

// Projections from input to hidden were created in the for loops above
hiddenLayer.project(outputLayer);

let network = new Network({
  input: inputLayer,
  hidden: [hiddenLayer],
  output: outputLayer
});

// Actually do the training
// https://github.com/cazala/synaptic/wiki/Trainer
let trainer = new Trainer(network);
trainer.train(trainingDatas, {
  rate: 0.05,
  iterations: 300,
  error: 0.001,
  shuffle: true,
  log: 1,
  cost: Trainer.cost.CROSS_ENTROPY
});
console.log('yey trained');

// Save first so if something goes wrong later we have the network
console.log('toJSON');
let netJSON = JSON.stringify(network.toJSON());

console.log('network json length', netJSON.length.toLocaleString());
fs.writeFileSync('./data/cardNetwork.json', netJSON);

console.log(`let's test it....`);
require('./cardNNTest')(network);
