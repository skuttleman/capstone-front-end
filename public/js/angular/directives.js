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
    controller: ['$rootScope', '$scope', 'Ajax', 'Socket', SidebarController]
  }
});

function SidebarController($rootScope, $scope, Ajax, Socket) {
  Socket.on('accept game', function(data) {
    // do the thing that makes the app go
    console.log(data);
  });
  Socket.on('reject game', function(data) {
    // do the thing that makes the app go
    console.log(data);
  });
  Socket.on('game updated', function(data) {
    // do the thing that makes the app go
    console.log(data);
  });
}
