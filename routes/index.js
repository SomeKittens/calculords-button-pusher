'use strict';

let express = require('express');
let adb = require('adbkit');
let uuid = require('node-uuid');
let fs = require('fs');
let db = require('../db');
let PhoneInterface = require('../logic/phone');
let bluebird = require('bluebird');
let exec = require('child_process').exec;

let client = adb.createClient();
let router = express.Router();

let EventEmitter = require('events');

class LevelDone extends EventEmitter {}
let ld = new LevelDone();

let takeScreenshot = () => {
  let id = uuid.v4();
  let fileStream = fs.createWriteStream(`./public/screens/${id}.png`);

  return client.screencap(process.env.SERIAL)
    .then(function (screencap) {
      return new bluebird(resolve => {
        screencap.pipe(fileStream);
        screencap.on('end', () => {
          resolve(id);
        });
      });
    });
};

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

// Contains data about a filled-out level
router.post('/level', (req, res) => {
  isPushing = true;
  console.log('/level', req.body);

  let filterCards = req.body.cards.filter(Number).join(',');
  let filterNums = req.body.nums.join(',');
  console.log('cards', filterCards);
  console.log('nums', filterNums);

  // Do calculations
  new bluebird((resolve, reject) => {
    console.log('starting');
    exec(`./calc-solver ${filterCards} ${filterNums}`, (stderr, stdout) => {
      if (stderr) {
        console.log('stderr');
        console.log(stderr);
        reject(stderr);
        return;
      }
      console.log('stdout');
      console.log(JSON.parse(stdout));
      resolve(JSON.parse(stdout)[0]);
    });
  })
  // Punch in solution
  .then(answer => {
    console.log('answer', answer);
    let phone = new PhoneInterface(req.body.cards, req.body.nums);

    bluebird.each(answer.stack, item => phone.performMath(item))
    .then(() => phone.putOnField())
    .then(() => {
      isPushing = false;
      console.log(phone.nums);
      // Only add to db once everything's finished successfully
      db.addLevel(req.body);
      console.log('emitting');
      ld.emit('done');
    });
  });

  res.status(200).end();
});

// TODO: Convert to SSE
let isPushing = false;
router.get('/onLevelDone', (req, res) => {
  // let sendSSE = msg => {
  //   msg = typeof msg === 'string' ? msg : JSON.stringify(msg);
  //   res.write('data: ' + msg + '\n\n');
  // };

  // res.writeHead(200, {
  //   'Connection': 'keep-alive',
  //   'Content-Type': 'text/event-stream',
  //   'Cache-Control': 'no-cache'
  // });

  // ld.on('done', () => {
  //   console.log('donzeo');
  //   takeScreenshot()
  //   .then(id => {
  //     console.log('id', id);
  //     sendSSE({id});
  //   })
  //   .catch(err => console.log('sse err:', err.message));
  // });

  // res.on('close', () => {
  //   console.log('ending');
  //   ld.removeAllListeners('done');
  // });
});

router.get('/screenshot', (req, res) => {
  bluebird.delay(2000)
  .then(() => takeScreenshot())
  .then(id => res.json({id}))
  .catch(function(err) {
      console.error('Something went wrong:', err.message, err.stack);
      res.status(500).end();
    });
});


/// MISC
router.get('/db.json', (req, res) => {
  let dbstuff = fs.readFileSync('./db.json', 'UTF-8');
  res.json(JSON.parse(dbstuff));
});
router.get('/checker', (req, res) => {
  res.render('checker');
});
router.get('/checker-comp', (req, res) => {
  res.render('checker-comp');
});

module.exports = router;
