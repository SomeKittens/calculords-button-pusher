/* globals angular*/

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
.controller('gaem', function ($interval, $scope, screenshot, uploadLevel) {
  'use strict';
  let g = this;
  // g.cards = [ '12', '18', '54', '10', '11', '17' ];
  // g.nums = [ '7', '8', '4', '6', '1', '9', '8', '5', '6' ];
  g.cards = [];
  g.nums = [];
  g.screenshotURL = '';


  // let evtSource = new EventSource('/onLevelDone');

  // evtSource.onmessage = (e) => {
  //   console.log('message from server:', e.data);
  //   try {
  //     g.screenshotURL = JSON.parse(e.data).id;
  //     g.loading = false;
  //     g.cards = [];
  //     g.nums = [];
  //     $scope.$apply();
  //   } catch (e) {console.log('BORT');}
  // };

  g.startLevel = () => {
    g.loading = false;
    screenshot().then(url => g.screenshotURL = url);
  };

  g.runLevel = () => {
    g.selected = null;
    g.results = null;
    g.loading = true;
    g.percent = 0;

    uploadLevel({
      filename: g.screenshotURL,
      cards: g.cards,
      nums: g.nums
    }).then(() => g.screenshotURL = '');
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
