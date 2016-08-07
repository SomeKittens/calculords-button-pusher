'use strict';

// TODO: Show solutions that use lots of cards but don't use all numbers
// For instance, second round

// TODO: prioritize certain cards

// Need a bunch of functions instead of straight eval to consider both sides of subtraction
// This way we can track what operations happened over time
let operations = [function add(a, b) {
  return {
    str: a + '+' + b,
    result: a + b
  };
}, function subtract(a, b) {
  return {
    str: a + '-' + b,
    result: a - b
  };
}, function subtractBack(a, b) {
  return {
    str: b + '-' + a,
    result: b - a
  };
}, function mult(a, b) {
  return {
    str: a + '*' + b,
    result: a * b
  };
}];

/**
 * Run the things!
 * @param  {int[]} cards    The numbers of the target cards
 * @param  {int[]} initInts The initial integer cards we're given
 * @return {Solution[]}     The set of possible solutions to the given inputs
 */
function runLevel(cards, initInts) {
  let solutions = [];
  let paths = {};

  // Used for checking how many times each section was called

  // How many times will we run through the original for loop?
  let totalWork = (initInts.length * (initInts.length - 1) / 2);
  let doneWork = 0;
  let found = false;
  let optimal = Math.min(4, cards.length);

  cards = cards.sort();
  initInts = initInts.sort();
  let skips = 0;

  /**
   * Recursive function for searching the solution space
   * @param  {string[]} stack Operations that have been done so far
   * @param  {int[]} ints  Current integer cards
   * @param  {Boolean} init  Is this the first run?  (used for postMessage progress bar)
   */
  function explore (stack, ints, init) {
    if (found) { return; }

    // Search!

    // We pull two numbers out of our set of integers & apply all of the operations
    // There's a lot of array shifting here but it's needed since we need to create a 'new' set of #'s
    outer:
    for (let i = 0; i < ints.length; i++) {
      let left = ints[i];
      let localInts = ints.slice();
      localInts.splice(i, 1);

      for (let j = i; j < localInts.length; j++) {
        let right = localInts.splice(j, 1)[0];

        for (let k = 0; k < operations.length; k++) {
          let r = operations[k](left, right);
          let checkInts = localInts.concat(r.result).sort();

          // If we've already gone down this path, no need to redo work
          let key = checkInts.join();
          if (paths[key]) {
            continue;
          } else {
            paths[key] = true;
          }


          // Base cases
          if (checkInts.length <= cards.length) {
            // We're done if all of the checkInts we have match (uniquely) cards
            let j = 0;
            for (let i = 0; i < cards.length; i++) {
              if (cards[i] === checkInts[j]) {
                // Match, increment both
                j++;
              }
            }

            // If all of the integer cards have matches, we've got a solution!
            if (j === checkInts.length) {

              solutions.push({
                stack: stack.concat(r.str),
                ints: checkInts
              });
              console.log(checkInts.length);
              // if (checkInts.length === optimal) {
              //   found = true;
              //   break outer;
              // }
              continue;
            }
          }

          // We'll accept the optimal number or one less, but no sense going further
          if (checkInts.length === optimal - 1) { continue; }

          explore(stack.concat(r.str), checkInts);
        }
        if (init) {
          console.log('% done', (++doneWork / totalWork * 100).toFixed(2));
        }
        localInts.unshift(right);
      }
      localInts.unshift(left);
    }
  }

  explore([], initInts, true);

  // Some statistics, because everyone loves stats!
  // console.log('`explore` was called', called.toLocaleString(), 'times');
  // console.log('`explore` (raw)', called);
  // console.log('`done check` was called', doneCheck.toLocaleString(), 'times');
  // console.log('`done check` (raw)', doneCheck);
  // console.log('`doneDone check` was called', doneDone.toLocaleString(), 'times');
  // console.log('`doneDone check` (raw)', doneDone);
  // console.log('`search check` was called', search.toLocaleString(), 'times');
  // console.log('`search check` (raw)', search);
  console.log('There were', Object.keys(paths).length.toLocaleString(), 'unique paths');
  // console.log('`paths` (raw)', Object.keys(paths).length);
  console.log('skips:', skips);

  return solutions;
}

module.exports = function(cards, nums) {
  console.time('calc');
  var result = runLevel(cards, nums);
  console.timeEnd('calc');
  return result;
};
