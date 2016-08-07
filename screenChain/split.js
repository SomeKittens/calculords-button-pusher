'use strict';

/**
 * Given a Calculords screenshot, slice out the cards & integers
 */

let conf = require('./config');
let Bluebird = require('bluebird');
let gm = require('gm');

module.exports = function parse (key, entry) {
  let coords = conf[key];
  let idx = 0;
  let proms = [];
  let numRows = key === 'nums' ? 3 : 2;
  for (let j = 0; j < numRows; j++) {
    for (let i = 0; i < 3; i++) {
      let value = +entry[key][idx] || 0;
      idx++;
      proms.push(new Bluebird((resolve, reject) => {
        gm(entry.screenBuf)
        .crop(coords.width, coords.height, (coords.x + (i * coords.width)), (coords.y + (j * coords.height)))
        .toBuffer('PNG',function (err, buffer) {
          if (err) {
            return reject(err);
          }
          resolve({
            i,j,
            key,
            value,
            buffer
          });
        });
      }));
    }
  }
  return proms;
};
