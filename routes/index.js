'use strict';

var express = require('express');
var router = express.Router();
let adb = require('adbkit');
let uuid = require('node-uuid');
let fs = require('fs');
let db = require('../db');
let PhoneInterface = require('../logic/phone');
let bluebird = require('bluebird');


let client = adb.createClient();
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

// Contains data about a filled-out level
router.post('/level', (req, res) => {
  db.addLevel(req.body);
  res.status(200).end();
});

let isPushing = false;
router.get('/isPushing', (req, res) => {
  res.json({
    isPushing
  });
});

router.post('/push', (req, res) => {
  isPushing = true;
  let answer = req.body.answer;
  let phone = new PhoneInterface(req.body.cards, req.body.nums);

  console.log('answer:', answer);
  let p = bluebird.resolve('hi mom');
  answer.stack.forEach(item => {
    // console.log('buttons for', item);
    p = p.then(() => phone.performMath(item));
  });
  p
  .then(() => phone.putOnField())
  .then(() => {
    isPushing = false;
    console.log(phone.nums);
  });

  res.status(200).end();

});

router.get('/screenshot', (req, res) => {
  let id = uuid.v4();
  let fileStream = fs.createWriteStream(`./public/screens/${id}.png`);

  client.screencap(process.env.SERIAL)
    .then(function (screencap) {
      screencap.pipe(fileStream);
      screencap.on('end', () => {
        res.json({
          id
        });
      });
    })
    .catch(function(err) {
      console.error('Something went wrong:', err.message, err.stack);
      res.status(500).end();
    });
});

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
