angular.module('capstone')
.factory('Socket', ['socketFactory', SocketFactory])

function SocketFactory(socketFactory) {
  var socket = io.connect(window.SERVER_HOST, {
    query: 'token=' + localStorage.token
  });
  return socketFactory({ ioSocket: socket });
}
