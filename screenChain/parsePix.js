'use strict';

/**
 * Converts a buffer representing a png image into an array of numbers between [0,1]
 */

let pngparse = require('pngparse');
let Bluebird = require('bluebird');

module.exports = function parsePix (conf) {
  return new Bluebird((resolve, reject) => {
    pngparse.parse(conf.buffer, function(err, imgData) {
      if(err) {
        return reject(err);
      }

      let input = [];
      for (let i = 0; i < imgData.data.length; i++) {
        input.push(imgData.data[i] / 255);
      }

      let arrSize = conf.key === 'nums' ? 10 : 100;
      let output = [];
      for (var i = 0; i < arrSize; i++) {
        output.push(0);
      }
      if (conf.value === 'x' || !conf.value) {
        output[0] = 1;
      } else {
        output[conf.value] = 1;
      }
      resolve({
        input,
        output
      });
    });
  });
};
