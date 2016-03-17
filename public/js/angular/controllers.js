angular.module('capstone')
.controller('MainController', ['$rootScope', 'GamesList', MainController])
.controller('DashboardController', ['$rootScope', '$scope', 'Ajax', '$location', DashboardController])
// .controller('GamesController', ['$rootScope', '$scope', 'Ajax', '$location', GamesController])
.controller('GameController', ['$rootScope', '$scope', 'Ajax', '$location', '$stateParams', 'GamesList', GameController])
.controller('InvitationController', ['$rootScope', '$scope', 'Ajax', '$location', '$stateParams', 'GamesList', InvitationController])
.controller('InvitationsController', ['$rootScope', '$scope', '$stateParams', '$location', 'Ajax', 'GamesList', InvitationsController])
.controller('LoginController', ['$rootScope', '$scope', 'Ajax', '$location', 'GamesList', LoginController])
.controller('LogoutController', ['$rootScope', '$location', 'GamesList', LogoutController]);



function MainController($rootScope, GamesList) {
  $rootScope.user = JSON.parse(localStorage.user || 'null');
  $rootScope.games = {};
  $rootScope.notifications = [];
  GamesList.refresh($rootScope.games);
}

function DashboardController($rootScope, $scope, Ajax, $location) {
  $rootScope.view = 'Dashboard';
  checkUser($rootScope.user, $location, '/login');
}

function GamesController($rootScope, $scope, Ajax, $location) {
  $rootScope.view = 'Games';
  checkUser($rootScope.user, $location, '/login');
}

function GameController($rootScope, $scope, Ajax, $location, $stateParams, GamesList) {
  $rootScope.view = 'Game';
  checkUser($rootScope.user, $location, '/login').then(function() {
    Ajax.get(window.SERVER_HOST + '/api/v1/games/' + $stateParams.id).then(function(results) {
      $scope.completed = results.data.games[0].game_status == 'completed';
      displayGame(results.data.games[0], $scope.user, Ajax, $location, function(completed) {
        GamesList.refresh($rootScope.games);
        $scope.completed = completed;
      });
      $scope.sendBack = window.sendBack;
      $scope.popMessage = window.popMessage;
    }).catch(err => console.error(err));
  });
}

function InvitationsController($rootScope, $scope, $stateParams, $location, Ajax, GamesList) {
  $rootScope.view = 'Invitations';
  $scope.games = $rootScope.games;
  $scope.invitationId = $stateParams.id;
  $scope.update = function(game, action) {
    Ajax.put(window.SERVER_HOST + '/api/v1/games/' + action + '/' + game.id, {}).then(function(results) {
      GamesList.refresh($rootScope.games);
      $location.url('/');
    });
  };
}
//ash was here
function InvitationController($rootScope, $scope, Ajax, $location, $stateParams, GamesList) {
  $rootScope.view = 'Invitation';
  Ajax.get(window.SERVER_HOST + '/api/v1/players').then(function(results) {
    $scope.players = results.data.players;
  });
  Ajax.get(window.SERVER_HOST + '/api/v1/games/levels').then(function(results) {
    $scope.levels = results.data.levels;
  });
  $scope.selectPlayer = function(player) {
    $scope.selectedPlayer = player;
  };
  $scope.selectLevel = function(level) {
    $scope.selectedLevel = level;
  };
  $scope.sendInvitation = function(player, level, playerNumber) {
    if (player && level && playerNumber) {
      var data = {
        is_player1: playerNumber == 1,
        other_player_id: player.id,
        level_id: level._id
      };
      Ajax.post(window.SERVER_HOST + '/api/v1/games', data).then(function(response) {
        $location.url('/');
        GamesList.refresh($rootScope.games);
      });
    }
  };
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
