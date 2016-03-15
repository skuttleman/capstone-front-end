angular.module('capstone')
.directive('capstoneHeader', function() {
  return {
    restrict: 'E',
    templateUrl: '/templates/header.html',
    scope: {
      view: '='
    },
    controller: ['$scope', function($scope) {
      $scope.navs = [
        { href: "/#/games/new", text: "New Game" },
        { href: "/#/settings", text: "Settings" },
        { href: "/#/logout", text: "Log Out" }
      ];
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
      $scope.getPending = getGames(Ajax, $scope, 'pending');
      $scope.whoseTurn = function(game) {
        console.log(game);
        var user = JSON.parse(localStorage.user);
        return (user.id == game.player1_id && game.game_status == 'player1 turn') ||
          (user.id == game.player2_id && game.game_status == 'player2 turn');
      };

      $scope.getActive();
      $scope.getInvitations();
      $scope.getPending();

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
      if ($scope) $scope[property] = results.data.games;
      if (property === 'active') {
        $scope[property].forEach(function(game){
          var user = JSON.parse(localStorage.user);
          game.playerTurn = game.game_status == 'player1 turn' ? game.player1 : game.player2;
          game.otherPlayer = game.player1.id == user.id ? game.player2 : game.player1;
          game.myTurn = user.id == game.playerTurn.id;
        });
      }
      return results.data.games;
    });
  };
}
