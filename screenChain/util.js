'use strict';

exports.shuffle = function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

exports.softmax = function softmax(arr) {
  let biggest = {
    val: Number.NEGATIVE_INFINITY,
    idx: -1
  };

  arr.forEach((item, idx) => {
    if (item > biggest.val) {
      biggest = {
        val: item,
        idx
      };
    }
  });

  return arr.map((item, idx) => {
    if (idx === biggest.idx) {
      return 1;
    }
    return 0;
  });
};

exports.getNumFromOutput = function (outputSize) {
  return function getNum(arr) {
    for(let i = 0; i < outputSize; i++) {
      if (arr[i]) {
        return i;
      }
    }
  };
};
