'use strict';

let fs = require('fs');
let adb = require('adbkit');
let client = adb.createClient();
let bluebird = require('bluebird');
let coords = require('./coords.json');

let spawn = require('child_process').spawn;

// client.shell(serial, 'echo $RANDOM')
//   // Use the readAll() utility to read all the content without
//   // having to deal with the events. `output` will be a Buffer
//   // containing all the output.
//   .then(adb.util.readAll)
//   .then(function(output) {
//     console.log('[%s] %s', serial, output.toString().trim());
//   });

// console.log(coords.nums[0]);

// let co = coords.nums[0][0];
// let command = `input tap ${co.x} ${co.y}`;
// console.log(command);
// client.shell(serial, command);

// x 00000174
// expected: 1092, got 292
// y 00000489
// expected: 691, got: 1161


let shortDist = 1080;
let convertToTap = (shortWay, longWay) => {

  // Going in wrong direction
  shortWay = shortDist - shortWay;

  let command = `input tap ${longWay} ${shortWay}`;
  // setTimeout(() => {
  //   console.log('tapBack');
  //   client.shell(serial, command);
  // }, 300);
  console.log(command);

  return {
    x: longWay,
    y: shortWay
  };
};

// convertToTap(parseInt('00000189', 16), parseInt('0000048c', 16));

let tapStream = spawn('adb', ['shell', 'getevent', '-l']);

// let xCoor = 0;
// let yCoor = 0;

tapStream.stdout.on('data', datum => {
  let items = datum.toString()
    .split(/\r\n/)
    .filter(Boolean)
    .map(line => line.split(/\s+/))
    .reduce((prev, line) => {
      let lastChar = line[2][16];
      if (lastChar === 'X' || lastChar === 'Y') {
        prev[lastChar.toLowerCase()] = parseInt(line[3], 16);
      }
      return prev;
    }, {});
    console.log(items);
  if (!isNaN(items.x) && !isNaN(items.y)) {
    let r = convertToTap(items.x, items.y);
    // coords.topLane = r;
    // fs.writeFileSync('./coords.json', JSON.stringify(coords));
    console.log(r);

    // yCoor++;
    // if (yCoor === 3) {
    //   yCoor = 0;
    //   xCoor++;
    // }
    // if (xCoor === 2) {
    //   process.exit();
    // }
  }
});
