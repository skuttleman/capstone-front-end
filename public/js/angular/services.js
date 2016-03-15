angular.module('capstone')
.factory('Socket', ['socketFactory', SocketFactory])
.service('Ajax', ['$http', HttpService]);

function SocketFactory(socketFactory) {
  var socket = io.connect(window.SERVER_HOST, {
    query: 'token=' + localStorage.token
  });
  return socketFactory({ ioSocket: socket });
}

function HttpService($http) {
  $http.defaults.headers.common.Authorization = 'Bearer ' + (localStorage.token || '');
  return $http;
}
