(function() {
  var dev = 'http://localhost:8000';
  var prod = 'https://g15-capstone.herokuapp.com';
  window.SERVER_HOST = window.location.hostname === 'localhost' ? dev : prod;
})();

angular.module('capstone', ['btford.socket-io', 'ui.router'])
.config(['$stateProvider', '$urlRouterProvider', Config]);

function Config($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider.state('dashboard', {
    templateUrl: '/templates/welcome.html',
    controller: 'DashboardController',
    url: '/'
  }).state('login', {
    templateUrl: '/templates/welcome.html',
    controller: 'LoginController',
    url: '/login'
  }).state('invitationForm', {
    templateUrl: '/templates/invitation-form.html',
    controller: 'InvitationController',
    url: '/games/new'
  }).state('game', {
    templateUrl: '/templates/game.html',
    controller: 'GameController',
    url: '/games/:id'
  }).state('invitation', {
    templateUrl: '/templates/invitation.html',
    controller: 'InvitationsController',
    url: '/invitations/:id'
  }).state('logout', {
    // templateURL: '/templates/logout.html',
    controller: 'LogoutController',
    url: '/logout'
  });
}
