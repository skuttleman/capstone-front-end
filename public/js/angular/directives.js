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
  };
}).directive('sidebar', function() {
  return {
    restrict: 'E',
    templateUrl: '/templates/sidebar.html',
    scope: {
      user: '=',
      games: '='
    },
    controller: ['$rootScope', '$scope', 'Ajax', 'Socket', 'GamesList', SidebarController]
  };
}).directive('pushNotifications', function() {
  return {
    restrict: 'E',
    templateUrl: '/templates/notifications.html',
    scope: {
      notifications: '='
    },
    controller: ['$scope', function($scope) {

    }]
  };
}).directive('modal', function() {
  return {
    restrict: 'E',
    templateUrl: '/templates/modal.html',
    scope: {
      title: '=',
      body: '=',
      buttons: '=',
      then: '='
    },
    controller: ['$rootScope', '$scope', function($rootScope, $scope) {
      $scope.cancel = function() {
        $rootScope.modalShown = false;
      }
    }]
  };
});

function SidebarController($rootScope, $scope, Ajax, Socket, GamesList) {
  ['accept game', 'reject game', 'game updated', 'new invitation', 'game completed']
  .forEach(function(name) {
    Socket.on(name, function(data) {
      console.log(name + ':', data);
      GamesList.refresh($rootScope.games);
      pushNotification(name, data, $rootScope.notifications, $scope);
    });
  });
}

function pushNotification(name, data, notifications, $scope) {
  if (name == 'game updated' || name == 'game completed') {
    data.href= '/#/games/' + data.id;
  } else if (name == 'new invitation') {
    data.href = '/#/invitations/' + data.id;
  }
  notifications.push(data);
  setTimeout(function() {
    notifications.shift();
    $scope.$apply();
  }, 5000);
}
