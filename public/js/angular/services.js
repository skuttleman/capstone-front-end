angular.module('capstone')
.factory('Socket', ['socketFactory', SocketFactory])

function SocketFactory(socketFactory) {
  return socketFactory();
}
