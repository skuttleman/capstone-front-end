angular.module('capstone')
.controller('MainController', ['$rootScope', 'GamesList', MainController])
.controller('DashboardController', ['$rootScope', '$scope', 'Ajax', '$location', DashboardController])
.controller('GameController', ['$rootScope', '$scope', 'Ajax', '$location', '$stateParams', 'GamesList', GameController])
.controller('InvitationController', ['$rootScope', '$scope', 'Ajax', '$location', '$stateParams', 'GamesList', InvitationController])
.controller('InvitationsController', ['$rootScope', '$scope', '$stateParams', '$location', 'Ajax', 'GamesList', InvitationsController])
.controller('LoginController', ['$rootScope', '$scope', 'Ajax', '$location', 'GamesList', LoginController])
.controller('LogoutController', ['$rootScope', '$location', 'GamesList', 'Socket', LogoutController]);



function MainController($rootScope, GamesList) {
  $rootScope.user = JSON.parse(localStorage.user || 'null');
  $rootScope.games = {};
  $rootScope.notifications = [];
  GamesList.refresh($rootScope.games);
}

function DashboardController($rootScope, $scope, Ajax, $location) {
  $rootScope.view = 'Dashboard';
  checkUser($rootScope.user, $location, '/login');
  $scope.patchPhoneNumber = function() {
    var title = 'Update Phone Number', number, body;
    if ($scope.phoneNumber) {
      number = String($scope.phoneNumber);
      body = 'Are you sure you want to update your phone number to: \'' + number + '\'?';
    } else {
      number = null;
      body = 'Are you sure you want to remove your phone number from the system?';
    }
    showModal($rootScope, 'confirm', 'Phone Number', body, function() {
      var url = window.SERVER_HOST + '/api/v1/players';
      Ajax.patch(url, { phoneNumber: number }).then(function() {
        showModal($rootScope, 'alert', 'Phone Number', 'Your phone number has been updated.');
      }).catch(err=> console.error(err));
    });
  };
  $scope.createLevel = function() {
    showModal($rootScope, 'alert', 'Level Creator', 'This feature is currently under construction');
  };
}

function GameController($rootScope, $scope, Ajax, $location, $stateParams, GamesList) {
  $rootScope.view = 'Game';
  checkUser($rootScope.user, $location, '/login').then(function() {
    return Ajax.get(window.SERVER_HOST + '/api/v1/games/' + $stateParams.id).then(function(results) {
      var game = results.data.games[0];
      if (game) {
        $scope.completed = results.data.games[0].game_status == 'completed';
        displayGame(results.data.games[0], $scope.user, function(data, completed, skip) {
          var message = 'Are you sure you want to send this move?';
          if (skip) {
            $location.url('/dashboard');
          } else if (completed) {
            var id = $stateParams.id;
            var move = (id == 'mock1' || id == 'mock2') ? id : 'move/' + id;
            Ajax.put(window.SERVER_HOST + '/api/v1/games/' + move, { state: data, completed: completed })
            .then(function(stupid) {
              delete methods.sendBack;
              delete methods.deepUpdate;
              delete window.pushToMessage;
              delete window.popMessage;
              GamesList.refresh($rootScope.games);
              $scope.completed = completed;
            }).catch(err=> console.error(err));
          } else {
            showModal($rootScope, 'confirm', 'Send Move', message, function() {
              var id = $stateParams.id;
              var move = (id == 'mock1' || id == 'mock2') ? id : 'move/' + id;
              Ajax.put(window.SERVER_HOST + '/api/v1/games/' + move, { state: data, completed: completed })
              .then(function() {
                delete methods.sendBack;
                delete methods.deepUpdate;
                delete window.pushToMessage;
                delete window.popMessage;
                GamesList.refresh($rootScope.games);
                $scope.completed = completed;
                if (!completed) $location.url('/dashboard');
              });
            });
          }
        });
        $scope.sendBack = window.sendBack;
        $scope.popMessage = window.popMessage;
      } else {
        $location.url('/dashboard');
      }
    });
  }).catch(err => console.error(err) || $location.url('/dashboard'));
}

function InvitationsController($rootScope, $scope, $stateParams, $location, Ajax, GamesList) {
  $rootScope.view = 'Invitations';
  $scope.games = $rootScope.games;
  $scope.invitationId = $stateParams.id;
  $scope.update = function(game, action) {
    var title, message;
    switch(action) {
      case 'cancel':
        action = 'reject';
        title = 'Cancel Invitation';
        message = 'Are You sure you want to cancel this invitation?';
        break;
      case 'reject':
        title = 'Reject Invitation';
        message = 'Are You sure you want to reject this invitation?';
        break;
      default:
        title = 'Accept Invitation';
        message = 'Are You sure you want to accept this invitation?';
    }
    showModal($rootScope, 'confirm', title, message, function() {
      Ajax.put(window.SERVER_HOST + '/api/v1/games/' + action + '/' + game.id, {})
      .then(function(results) {
        GamesList.refresh($rootScope.games);
        $location.url('/dashboard');
      });
    });
  };
}
//ash was here
function InvitationController($rootScope, $scope, Ajax, $location, $stateParams, GamesList) {
  $rootScope.view = 'Invitation';
  Ajax.get(window.SERVER_HOST + '/api/v1/players').then(function(results) {
    $scope.players = results.data.players.filter(player=> player.id != $rootScope.user.id);
  });
  Ajax.get(window.SERVER_HOST + '/api/v1/games/levels').then(function(results) {
    $scope.levels = results.data.levels;
  });
  $scope.sendInvitation = function(players, levels, is_player1) {
    if (players && players.length && levels && levels.length) {
      console.log(!!is_player1);
      var data = {
        is_player1: is_player1,
        other_player_id: getRandomElement(players).id,
        level_id: getRandomElement(levels)._id
      };
      Ajax.post(window.SERVER_HOST + '/api/v1/games', data).then(function(response) {
        $location.url('/dashboard');
        GamesList.refresh($rootScope.games);
      });
    }
  };
}

function LoginController($rootScope, $scope, Ajax, $location, GamesList) {
  $rootScope.view = 'Login';
  if ($location.search().token) {
    localStorage.token = $location.search().token;
    var token = $location.search().token.split('.')[1];
    var parsed = JSON.parse(atob(token));
    if (parsed && typeof parsed.user != 'string') {
      parsed.user = JSON.stringify(parsed.user);
    }
    localStorage.user = parsed.user;
    $rootScope.user = JSON.parse(parsed.user);
  }
  if ($rootScope.user) {
    GamesList.refresh($rootScope.games);
    $location.url('/');
  }
  $scope.toggleTheme = function() {
    var song = document.querySelector('audio.theme-song');
    $scope.themeMusic = !$scope.themeMusic;
    if (song && $scope.themeMusic) {
      song.play();
    } else  if (song) {
      song.pause();
      song.currentTime = 0;
    }
  };
}

function LogoutController($rootScope, $location, GamesList, Socket) {
  delete localStorage.token;
  delete localStorage.user;
  delete $rootScope.user;
  GamesList.clear($rootScope.games);
  Socket.disconnect();
  $location.url('/login');
}

function checkUser(user, $location, path, truthiness) {
  if (!!user === !!truthiness && $location) {
    $location.url(path);
  }
  return Promise.resolve(user);
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function showModal($rootScope, type, title, message, then) {
  $rootScope.modalTitle = title;
  $rootScope.modalBody = message;
  $rootScope.modalThen = function(input) {
    $rootScope.modalShown = false;
    setTimeout(function() {
      then && then(input);
    }, 0);
  };
  $rootScope.modalShown = true;
  if (type == 'alert') {
    $rootScope.modalButtons = ['ok'];
  } else if (type == 'confirm') {
    $rootScope.modalButtons = ['ok', 'cancel'];
  } else {
    $rootScope.modalButtons = ['ok', 'cancel', 'input'];
  }
  setTimeout(function() {
    ['button.modal-ok', 'input.modal-input'].forEach(function(selector) {
      var element = document.querySelector(selector);
      if (element) element.focus();
    });
  }, 0);
}
