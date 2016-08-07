'use strict';

/**
 * Structure:
 * x/y: upper left corner of the section
 * width/height: size of the actual 'card' itself
 * slice: This is the actual number we want (rather than the superfluous suff)
 *   width/height
 *   x/y
 */

module.exports = {
  nums: {
    x: 735,
    y: 604,
    width: 271,
    height: 156,
    slice: {
      x: 110,
      y: 40,
      width: 50, // 160 - 110,
      height: 75 // 115 - 40
    }
  },
  cards: {
    x: 0,
    y: 600,
    width: 243,
    height: 240,
    slice: {
      x: 19,
      y: 31,
      width: 95, // 108 - 19
      height: 71 // 102 - 31
    }
  }
};
