'use strict';

/**
 * Takes a screenshot of Calculords
 */

let adb = require('adbkit');
let client = adb.createClient();
let Bluebird = require('bluebird');

module.exports = () => {
  return client.screencap(process.env.SERIAL)
    .then(function (screencap) {
      return new Bluebird(resolve => {

        var buffers = [];
        screencap.on('data', function(buffer) {
          buffers.push(buffer);
        });
        screencap.on('end', function() {
          var buffer = Buffer.concat(buffers);
          resolve(buffer);
        });
      });
    });
};
