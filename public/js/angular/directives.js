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
    controller: ['$rootScope', '$scope', 'Ajax', 'Socket', function($rootScope, $scope, Ajax, Socket) {
      $scope.active = [], $scope.invitations = [];
      $scope.getActive = getGames(Ajax, $scope, 'active');
      $scope.getInvitations = getGames(Ajax, $scope, 'invitations');

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

function getGames(Ajax, $scope, property) {
  return function() {
    Ajax.get(window.SERVER_HOST + '/api/v1/games/' + property).then(function(results) {
      $scope[property] = results.data.games;
    });
  };
}
