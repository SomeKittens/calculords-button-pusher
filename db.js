'use strict';

let fs = require('fs');
let assert = require('assert');

let db = JSON.parse(fs.readFileSync('./db.json'));

let save = () => {
  fs.writeFileSync('./db.json', JSON.stringify(db));
};

module.exports = {
  addLevel: level => {
    ['filename', 'cards', 'nums']
    .forEach(key => assert.ok(level[key], `level missing ${key}`));
    db.push(level);
    save();
  }
};
