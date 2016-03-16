angular.module('capstone')
.directive('capstoneHeader', function() {
  return {
    restrict: 'E',
    templateUrl: '/templates/header.html',
    scope: {
      view: '=',
      user: '='
    },
    controller: ['$scope', function($scope) {
      $scope.navs = [
        { href: "/#/games/new", text: "New Game" },
        // { href: "/#/settings", text: "Settings" },
        { href: "/#/logout", text: "Log Out" }
      ];
    }]
  }
}).directive('sidebar', function() {
  return {
    restrict: 'E',
    templateUrl: '/templates/sidebar.html',
    scope: {
      user: '=',
      games: '='
    },
    controller: ['$rootScope', '$scope', 'Ajax', 'Socket', 'GamesList', SidebarController]
  }
});

function SidebarController($rootScope, $scope, Ajax, Socket, GamesList) {
  ['accept game', 'reject game', 'game updated', 'new invitation']
  .forEach(function(name) {
    Socket.on(name, function(data) {
      console.log(name + ':', data);
      GamesList.refresh($rootScope.games);
      pushNotification(name, data);
    });
  });
}

function pushNotification(name, data) {
  
}
