angular.module('capstone')
.controller('DashboardController', ['$rootScope', '$scope', '$http', '$location', DashboardController])
.controller('GamesController', ['$rootScope', '$scope', '$http', '$location', GamesController])
.controller('GameController', ['$rootScope', '$scope', '$http', '$location', '$stateParams', GameController])
.controller('InvitationController', ['$rootScope', '$scope', '$http', '$location', '$stateParams', InvitationController])
.controller('LoginController', ['$rootScope', '$scope', '$http', '$location', LoginController]);

function DashboardController($rootScope, $scope, $http, $location) {
  $rootScope.view = 'Dashboard';
  checkUser($scope, $http, $location, '/login');
}

function GamesController($rootScope, $scope, $http, $location) {
  $rootScope.view = 'Games';
  checkUser($scope, $http, $location, '/login');
}

function GameController($rootScope, $scope, $http, $location, $stateParams) {
  $rootScope.view = 'Game';
  checkUser($scope, $http, $location, '/login').then(function() {
    $http.get('/api/games/' + $stateParams.id).then(function(results) {
      displayGame(results.data.games[0], $scope.user, $http, $location);
      $scope.sendBack = window.sendBack;
      $scope.popMessage = window.popMessage;
    });
  });
}

function InvitationController($rootScope, $scope, $http, $location, $stateParams) {
  $rootScope.view = 'Invitations';
  checkUser($scope, $http, $location, '/login');
}

function LoginController($rootScope, $scope, $http, $location) {
  $rootScope.view = 'Login';
  checkUser($scope, $http, $location, '/', true);
}

function checkUser($scope, $http, $location, path, truthiness) {
  return $http.get('/api/players/me').then(function(result) {
    $scope.user = result.data.user;
    if (!!result.data.user === !!truthiness) {
      $location.url(path);
    }
  });
}
