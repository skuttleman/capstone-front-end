angular.module('capstone')
.controller('DashboardController', ['$rootScope', '$scope', 'Ajax', '$location', DashboardController])
.controller('GamesController', ['$rootScope', '$scope', 'Ajax', '$location', GamesController])
.controller('GameController', ['$rootScope', '$scope', 'Ajax', '$location', '$stateParams', GameController])
.controller('InvitationController', ['$rootScope', '$scope', 'Ajax', '$location', '$stateParams', InvitationController])
.controller('LoginController', ['$rootScope', '$scope', 'Ajax', '$location', LoginController]);

function DashboardController($rootScope, $scope, Ajax, $location) {
  $rootScope.view = 'Dashboard';
  checkUser($scope, $location, '/login');
}

function GamesController($rootScope, $scope, Ajax, $location) {
  $rootScope.view = 'Games';
  checkUser($scope, $location, '/login');
}

function GameController($rootScope, $scope, Ajax, $location, $stateParams) {
  $rootScope.view = 'Game';
  checkUser($scope, $location, '/login').then(function() {
    Ajax.get(window.SERVER_HOST + '/api/v1/games/' + $stateParams.id).then(function(results) {
      displayGame(results.data.games[0], $scope.user, Ajax, $location);
      $scope.sendBack = window.sendBack;
      $scope.popMessage = window.popMessage;
    }).catch(err => console.error(err));
  });
}

function InvitationController($rootScope, $scope, Ajax, $location, $stateParams) {
  $rootScope.view = 'Invitations';
  checkUser($scope, $location, '/login');
}

function LoginController($rootScope, $scope, Ajax, $location) {
  $rootScope.view = 'Login';
  if ($location.search().token) {
    localStorage.token = $location.search().token;
    var token = $location.search().token.split('.')[1];
    var user = JSON.parse(atob(token));
    localStorage.user = JSON.stringify(user && user.user);
  }
  checkUser($scope, $location, '/', true);
}

function checkUser($scope, $location, path, truthiness) {
  $scope.user = JSON.parse(localStorage.user || 'null');
  if (!!$scope.user === !!truthiness) {
    $location.url(path);
  }
  return Promise.resolve($scope.user);
}
