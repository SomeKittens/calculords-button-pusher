'use strict';

let Bluebird = require('bluebird');
let fs = Bluebird.promisifyAll(require('fs'));
let db = require('../db.json');

let greyify = require('./greyify');
let slice = require('./slice');
let split = require('./split');
let parsePix = require('./parsePix');
let processCardPixelData = require('./processCardPixelData');
let expect = require('chai').expect;
let util = require('./util');

let i = 0;
function parseImage(entry) {
  console.log('processing', i);
  i++;
  return greyify(entry)
  .then(grey => {
    return Bluebird.props({
      cards: Bluebird.all(split('cards', entry, grey)),
      nums: Bluebird.all(split('nums', entry, grey))
    });
  })
  .then(promises => {
    console.log('--- slicing---');
    return Bluebird.props({
      cards: Bluebird.map(promises.cards, slice),
      nums: Bluebird.map(promises.nums, slice)
    });
  })
  .then(slices => {
    console.log('--- pixel parsing ---');
    return Bluebird.props({
      cards: Bluebird.map(slices.cards, parsePix),
      nums: Bluebird.map(slices.nums, parsePix)
    })
    .then(pixels => {
      pixels._meta = entry;
      return pixels;
    });
  });
}

let numCPU = require('os').cpus().length;
Bluebird.map(db, item => {
  return fs.readFileAsync(`../public/screens/${item.filename}.png`)
  .then(fileData => {
    item.screenBuf = fileData;
    return item;
  });
}, {concurrency: numCPU})
.map(parseImage, {concurrency: numCPU})
.then(trainingData => {
  console.log('--- saving ---');

  // let counts = (new Array(100)).fill(0);
  let numBlank = 0;
  let cards = trainingData.map(item => {
    return item.cards.map((x, idx) => {
      let num;
      if (item._meta.cards[idx] === 'x' || item._meta.cards[idx] === undefined) {num = 0;}
      else {num = +item._meta.cards[idx];}
      x._meta = num;
      return x;
    });
  })
  .reduce((prev, item) => prev.concat(item))
  .filter(item => {
    if (item._meta === 0) {
      numBlank++;
      return numBlank < 30;
    }
    return true;
  });
  cards = util.shuffle(processCardPixelData(cards));

  expect(cards).to.be.an('array');
  cards.forEach(card => {
    expect(card).to.have.property('input');
    expect(card).to.have.property('output');
    expect(card.input).to.be.an('array');
    expect(card.output).to.be.an('array');
  });

  let formattedData = {
    cards,
    nums: trainingData.map(item => item.nums).reduce((prev, item) => prev.concat(item))
  };

  let testSet = {
    nums: formattedData.nums.splice(0, Math.floor(formattedData.nums.length * 0.3)),
    cards: formattedData.cards.splice(0, Math.floor(formattedData.cards.length * 0.3))
  };

  return Bluebird.all([
    fs.writeFileAsync('./data/trainingSet.json', JSON.stringify(formattedData)),
    fs.writeFileAsync('./data/testSet.json', JSON.stringify(testSet))
  ]);
})
.catch(err => console.log('error:', err));
