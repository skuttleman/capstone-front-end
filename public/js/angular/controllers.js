angular.module('capstone')
.controller('DashboardController', ['$rootScope', '$scope', '$http', '$location', DashboardController])
.controller('GamesController', ['$rootScope', '$scope', '$http', '$location', GamesController])
.controller('GameController', ['$rootScope', '$scope', '$http', '$location', '$stateParams', GameController])
.controller('InvitationController', ['$rootScope', '$scope', '$http', '$location', '$stateParams', InvitationController])
.controller('LoginController', ['$rootScope', '$scope', '$http', '$location', LoginController]);

function DashboardController($rootScope, $scope, $http, $location) {
  $rootScope.view = 'Dashboard';
  checkUser($scope, $location, '/login');
}

function GamesController($rootScope, $scope, $http, $location) {
  $rootScope.view = 'Games';
  checkUser($scope, $location, '/login');
}

function GameController($rootScope, $scope, $http, $location, $stateParams) {
  $rootScope.view = 'Game';
  checkUser($scope, $location, '/login').then(function() {
    // $http.get(window.SERVER_HOST + '/api/v1/games/' + $stateParams.id).then(function(results) {
    //   displayGame(results.data.games[0], $scope.user, $http, $location);
    //   $scope.sendBack = window.sendBack;
    //   $scope.popMessage = window.popMessage;
    // });
  });
}

function InvitationController($rootScope, $scope, $http, $location, $stateParams) {
  $rootScope.view = 'Invitations';
  checkUser($scope, $location, '/login');
}

function LoginController($rootScope, $scope, $http, $location) {
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
}
