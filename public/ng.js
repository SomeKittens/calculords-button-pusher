/* globals angular*/

Notification.requestPermission();

angular.module('calc', [])
.factory('screenshot', function ($http) {
  'use strict';
  return () => $http.get('/screenshot')
    .then(res => res.data.id);
})
.factory('uploadLevel', function ($http) {
  'use strict';
  return (levelData) => $http.post('/level', levelData)
    .then(res => res.data);
})
.factory('answer', function ($http) {
  'use strict';
  return (levelData) => $http.post('/push', levelData);
})
.factory('processLevel', function ($q) {
  'use strict';
  return function (cards, nums) {
    let levelPromise = $q.defer();
    let worker = new Worker('calculords.js');

    worker.postMessage({
      cards: cards.filter(x => x !== 'x').map(c => +c),
      nums: nums.map(n => +n)
    });

    worker.onmessage = e => {
      console.log('message', e.data);
      if (typeof e.data === 'object') {
        levelPromise.resolve(e);
      } else {
        levelPromise.notify(e.data * 100);
      }
    };

    return levelPromise.promise;
  };
})
.factory('isPushing', function ($http) {
  'use strict';
  return () => $http.get('/isPushing').then(res => res.data);
})
.controller('gaem', function ($interval, processLevel, screenshot, uploadLevel, answer, isPushing) {
  'use strict';
  let g = this;
  // g.cards = ['52','9','2','12','28', '2'];
  // g.nums = ['6', '5', '9', '1', '7', '8', '6', '5'];
  g.cards = [];
  g.nums = [];
  g.screenshotURL = '';


  g.startLevel = () => {
    screenshot().then(url => g.screenshotURL = url);
  };

  let completeWork = (e) => {
    if (Notification.permission === 'granted') {
      new Notification('Processing completed');
    }

    g.loading = false;
    g.results = e.data;
    console.log('results.length', g.results.length);
    let largest = g.results.reduce((p, s) => {
      if (s.ints.length > p) {
        return s.ints.length;
      }
      return p;
    }, 0);

    let sorted = g.results.sort((a, b) => b.ints.length - a.ints.length);

    if (g.results.length) {
      console.log(`${g.results.length} Solutions found`);
      console.log(`Best solution allows ${largest} card(s)`);
      console.log(sorted.slice(0, 10));
      answer({
        cards: g.cards,
        nums: g.nums,
        answer: sorted[0]
      });
    } else {
      console.log('No solutions found');
    }
  };

  g.runLevel = () => {
    g.selected = null;
    g.results = null;
    g.loading = true;
    g.percent = 0;

    // Mebby eval async?

    processLevel(g.cards, g.nums)
    .then(
      completeWork,
      () => {}, // errs
      percent => g.percent = percent
    ).then(() => {
      let pushInt = $interval(() => {
        return isPushing()
          .then(result => {
          if (!result.isPushing) {
            $interval.cancel(pushInt);
            g.results = null;
            g.loading = false;
            g.cards = [];
            g.nums = [];
            g.screenshotURL = '';
          }
        });
      }, 1000);
    });

    uploadLevel({
      filename: g.screenshotURL,
      cards: g.cards,
      nums: g.nums
    });
  };

  g.useSolution = (solution) => {
    solution.ints.forEach(i => {
      let idx = g.cards.indexOf(i+'');
      if (idx !== -1) {
        g.cards.splice(idx, 1);
      }
    });
    g.nums = [];
    g.results = [solution];
    g.selected = solution;
  };
})
.component('checker', {
  templateUrl: 'checker-comp',
  controller: function ($http) {
    'use strict';
    $http.get('db.json')
    .then(res => this.db = res.data);
  }
});
