angular.module('capstone')
.factory('Socket', ['socketFactory', '$location', SocketFactory])
.service('Ajax', ['$http', HttpService])
.service('GamesList', ['$http', GamesList]);

function SocketFactory(socketFactory, $location) {
  var token = localStorage.token || $location.search().token;
  var socket = io.connect(window.SERVER_HOST, {
    query: 'token=' + token
  });
  var factory = socketFactory({ ioSocket: socket });
  factory.disconnect = socket.disconnect.bind(socket);
  return factory;
}

function HttpService($http) {
  $http.defaults.headers.common.Authorization = 'Bearer ' + (localStorage.token || '');
  return $http;
}

function GamesList($http) {
  return {
    clear: function(games) {
      if (!games) return;// console.log('no games object');
      Object.keys(games).forEach(key=> games[key] = []);
    },
    refresh: function(games) {
      if (!games) return;// console.log('no games object');
      var Ajax = HttpService($http);
      ['invitations', 'pending', 'active'].forEach(getGames(games, Ajax));
    }
  };
}

function getGames(games, Ajax) {
  return function(property) {
    var user = JSON.parse(localStorage.user || 'null');
    if (!localStorage.token || !user) return;// console.log('no token');
    Ajax.get(window.SERVER_HOST + '/api/v1/games/' + property).then(function(results) {
      games[property] = results.data.games;
      results.data.games.forEach(function(game) {
        var myPlayerNum = game.player1.id == user.id ? 1 : 2;
        game.otherPlayer = game['player' + (myPlayerNum * -1 + 3)];
        game.myTurn = game.game_status == 'player' + myPlayerNum + ' turn';
      });
    });
  };
}
