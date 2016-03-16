angular.module('capstone')
.controller('MainController', ['$rootScope', 'GamesList', MainController])
.controller('DashboardController', ['$rootScope', '$scope', 'Ajax', '$location', DashboardController])
// .controller('GamesController', ['$rootScope', '$scope', 'Ajax', '$location', GamesController])
.controller('GameController', ['$rootScope', '$scope', 'Ajax', '$location', '$stateParams', GameController])
// .controller('InvitationController', ['$rootScope', '$scope', 'Ajax', '$location', '$stateParams', InvitationController])
.controller('LoginController', ['$rootScope', '$scope', 'Ajax', '$location', 'GamesList', LoginController])
.controller('LogoutController', ['$rootScope', '$location', 'GamesList', LogoutController]);



function MainController($rootScope, GamesList) {
  $rootScope.user = JSON.parse(localStorage.user || 'null');
  $rootScope.games = {};
  GamesList.refresh($rootScope.games);
}

function DashboardController($rootScope, $scope, Ajax, $location) {
  $rootScope.view = 'Dashboard';
  checkUser($rootScope.user, $location, '/login');
  if ($rootScope.user) {

  }
}

function GamesController($rootScope, $scope, Ajax, $location) {
  $rootScope.view = 'Games';
  checkUser($rootScope.user, $location, '/login');
}

function GameController($rootScope, $scope, Ajax, $location, $stateParams) {
  $rootScope.view = 'Game';
  checkUser($rootScope.user, $location, '/login').then(function() {
    Ajax.get(window.SERVER_HOST + '/api/v1/games/' + $stateParams.id).then(function(results) {
      displayGame(results.data.games[0], $scope.user, Ajax, $location);
      $scope.sendBack = window.sendBack;
      $scope.popMessage = window.popMessage;
    }).catch(err => console.error(err));
  });
}

function InvitationController($rootScope, $scope, Ajax, $location, $stateParams) {
  $rootScope.view = 'Invitations';
  checkUser($rootScope.user, $location, '/login');
}

function LoginController($rootScope, $scope, Ajax, $location, GamesList) {
  $rootScope.view = 'Login';
  $scope.loginLocation = window.SERVER_HOST + '/auth/gplus';
  if ($location.search().token) {
    localStorage.token = $location.search().token;
    var token = $location.search().token.split('.')[1];
    var user = JSON.parse(atob(token));
    localStorage.user = JSON.stringify(user && user.user);
    $rootScope.user = user;
  }
  if (user) {
    GamesList.refresh($rootScope.games);
    $location.url('/');
  }
}

function LogoutController($rootScope, $location, GamesList) {
  delete localStorage.token;
  delete localStorage.user;
  delete $rootScope.user;
  GamesList.clear($rootScope.games);
  $location.url('/login');
}

function checkUser(user, $location, path, truthiness) {
  if (!!user === !!truthiness && $location) {
    $location.url(path);
  }
  return Promise.resolve(user);
}
