window.SERVER_HOST = 'http://localhost:8000';

angular.module('capstone', ['btford.socket-io', 'ui.router'])
.config(['$stateProvider', '$urlRouterProvider', Config]);

function Config($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider.state('dashboard', {
    templateUrl: '/templates/dashboard.html',
    controller: 'DashboardController',
    url: '/'
  }).state('games', {
    templateUrl: '/templates/games.html',
    controller: 'GamesController',
    url: '/games'
  }).state('game', {
    templateUrl: '/templates/game.html',
    controller: 'GameController',
    url: '/games/:id'
  }).state('invitation', {
    templateUrl: '/templates/invitation.html',
    controller: 'InvitationController',
    url: '/invitations/:id'
  }).state('login', {
    templateURL: '/templates/login.html',
    controller: 'LoginController',
    url: '/login'
  });
}
