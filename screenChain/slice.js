'use strict';

/**
 * Given a card or num, slices out the number part we care about
 */

let conf = require('./config');
let gm = require('gm');
let Bluebird = require('bluebird');

module.exports = (rawSplit) => {
  let coords = conf[rawSplit.key].slice;
  return new Bluebird((resolve, reject) => {
    gm(rawSplit.buffer)
    .crop(coords.width, coords.height, coords.x, coords.y)
    .resize(coords.width / 2, coords.height / 2)
    .channel('gray')
    .toBuffer('PNG',function (err, buffer) {
        if (err) {
          return reject(err);
        }
        rawSplit.buffer = buffer;
        resolve(rawSplit);
      });
    });
};
