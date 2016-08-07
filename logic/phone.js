'use strict';

/**
 * using ADB, interfaces with phone
 */
let bluebird = require('bluebird');
let coords = require('../coords.json');
let exec = require('child_process').exec;

let operatorMap = {
  '+': coords.plus,
  '-': coords.minus,
  '*': coords.times
};

class PhoneInterface {
  constructor(cards, nums) {
    this.empty = Symbol('empty-slot');
    this.using = Symbol('Using');

    this.cards = [[], []];
    this.nums = [[], [], []];
    this.selected = {};

    let idx = -1;
    this.cards[0][0] = cards[++idx] && cards[idx] !== 'x' ? +cards[idx] : this.empty;
    this.cards[0][1] = cards[++idx] && cards[idx] !== 'x' ? +cards[idx] : this.empty;
    this.cards[0][2] = cards[++idx] && cards[idx] !== 'x' ? +cards[idx] : this.empty;

    this.cards[1][0] = cards[++idx] && cards[idx] !== 'x' ? +cards[idx] : this.empty;
    this.cards[1][1] = cards[++idx] && cards[idx] !== 'x' ? +cards[idx] : this.empty;
    this.cards[1][2] = cards[++idx] && cards[idx] !== 'x' ? +cards[idx] : this.empty;
    console.log('init', this.cards);
    idx = -1;
    this.nums[0][0] = +nums[++idx] || this.empty;
    this.nums[0][1] = +nums[++idx] || this.empty;
    this.nums[0][2] = +nums[++idx] || this.empty;

    this.nums[1][0] = +nums[++idx] || this.empty;
    this.nums[1][1] = +nums[++idx] || this.empty;
    this.nums[1][2] = +nums[++idx] || this.empty;

    this.nums[2][0] = +nums[++idx] || this.empty;
    this.nums[2][1] = +nums[++idx] || this.empty;
    this.nums[2][2] = +nums[++idx] || this.empty;
  }
  pushButton(coords) {
    return new bluebird((resolve, reject) => {
      // console.log('-----tapping');
      // console.log(this.nums);
      // console.log('-----/tapping');

      let command = `input tap ${coords.x} ${coords.y}`;
      exec('adb shell ' + command, function (err) {
        if (err) { reject(err); }
        resolve('yay');
      });
    });
  }
  pushButtonAll (fn, key) {
    return idx => {
      console.log(`------pushButtonAll ${key}------`);
      console.log('key:', key);
      console.log('selected:', this.selected);
      console.log('idx', idx);
      if (key === 'nums' && this.selected.x === idx.x && this.selected.y === idx.y) {
        return bluebird.resolve();
      }
      console.log('actually pushing ze button', idx);
      return this.pushButton(fn(idx));
    };
  }
  getItemIdx (key) {
    return item => {
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          if (this[key][x][y] === item) {
            this[key][x][y] = this.using;
            return {x,y};
          }
        }
      }

      console.log(this[key]);

      throw new Error(`Expected ${key} ${item} to be present`);
    };
  }
  coordsByIdx (key) {
    return (idx) => {
      console.log('idx', key, coords[key][idx.x][idx.y]);
      return coords[key][idx.x][idx.y];
    };
  }
  selectTopRow() {
    this.pushButton(coords.topLane);
  }
  // This will skip the selected check
  // Otherwise, we'd never be able to deselect!
  deselect () {
    console.log('deselect', this.selected);
    if (this.selected.x !== undefined && this.selected.y !== undefined) {
      return this.pushButton(this.coordsByIdx('nums')(this.selected))
      .then(() => {
        this.selected = {};
        console.log('in deselect: ', this.selected);
      });
    } else {
      return bluebird.resolve();
    }
  }

  performMath(eqStr) {
    let getNumIdx = this.getItemIdx('nums');

    let pushButtonNum = this.pushButtonAll(this.coordsByIdx('nums'), 'nums');

    let eq = eqStr.split(' ');
    eq[0] = +eq[0];
    eq[2] = +eq[2];
    console.log('\n\n\n' + eqStr);

    let leftIdx = getNumIdx(eq[0]);
    let rightIdx = getNumIdx(eq[2]);


    return pushButtonNum(leftIdx)
    .then(() => this.selected = leftIdx)
    .then(() => this.pushButton(operatorMap[eq[1]]))
    .then(() => pushButtonNum(rightIdx))
    .then(() => {
      this.nums[leftIdx.x][leftIdx.y] = this.empty;
      this.selected = rightIdx;
      this.nums[rightIdx.x][rightIdx.y] = eval(eqStr);
      // console.log(this.nums);
    });
  }

  putOnField() {
    let getCardIdx = this.getItemIdx('cards');
    let getNumIdx = this.getItemIdx('nums');

    let pushButtonCard = this.pushButtonAll(this.coordsByIdx('cards'), 'cards');
    let pushButtonNum = this.pushButtonAll(this.coordsByIdx('nums'), 'nums');

    let todo = this.nums[0].concat(this.nums[1], this.nums[2])
    .filter(item => typeof item !== 'symbol');

    return this.deselect()
    .then(() => {
      return bluebird.each(todo, num => {
        console.log('queuing', num);
        return bluebird.resolve()
          .then(() => console.log('\n\n\n\n\ndeploying:', num))
          .then(() => pushButtonNum(getNumIdx(num)))
          .then(() => pushButtonCard(getCardIdx(num)))
          .then(() => this.selectTopRow())
          .then(() => {
            console.log('cards', this.cards);
            console.log('nums', this.nums);
            return bluebird.delay(2000);
          });
      });
    });

  }
}

module.exports = PhoneInterface;
