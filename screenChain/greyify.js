'use strict';

/**
 * Given a buffer representing a png file, convert it to greyscale
 */

let gm = require('gm');
let Bluebird = require('bluebird');

module.exports = entry => {
  return new Bluebird((resolve, reject) => {
    return gm(entry.screenBuf)
    .channel('gray')
    .toBuffer('PNG',function (err, buffer) {
      if (err) {
        return reject(err);
      }
      entry.buffer = buffer;
      resolve(entry);
    });
  });
};
