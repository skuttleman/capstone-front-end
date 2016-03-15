angular.module('capstone')
.directive('capstoneHeader', function() {
  return {
    restrict: 'E',
    templateUrl: '/templates/header.html',
    scope: {
      view: '='
    },
    controller: ['$scope', function($scope) {

    }]
  }
}).directive('sidebar', function() {
  return {
    restrict: 'E',
    templateUrl: '/templates/sidebar.html',
    scope: {
      view: '='
    },
    controller: ['$rootScope', '$scope', '$http', 'Socket', function($rootScope, $scope, $http, Socket) {
      $scope.active = [], $scope.invitations = [];
      $scope.getActive = getGames($http, $scope, 'active');
      $scope.getInvitations = getGames($http, $scope, 'invitations');

      $scope.getActive();
      $scope.getInvitations();
      Socket.on('invitation update', function(data) {
        // do the thing that makes the app go
        console.log(data);
      });
      Socket.on('active update', function(data) {
        // do the thing that makes the app go
        console.log(data);
      });
    }]
  }
});

function getGames($http, $scope, property) {
  return function() {
    $http.get('/api/games/' + property).then(function(results) {
      $scope[property] = results.data.games;
    });
  };
}
