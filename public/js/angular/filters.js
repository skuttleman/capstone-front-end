angular.module('capstone')
.filter('milliseconds', function() {
  return function(input) {
    var milliseconds = Math.round(Number(input) * 1000);
    return milliseconds ? String(milliseconds) + 'ms' : '';
  };
})
.filter('shorten', function() {
  return function(input, maxLength) {
    maxLength = Math.max(maxLength || 20, 3);
    if (String(input).length <= maxLength) return input;
    else return input.substr(0, maxLength - 3) + '...';
  };
})
.filter('where', function() {
  return function(array, id) {
    return array && array.filter(item=> item.id == id);
  };
})
.filter('inArray', function() {
  return function(array, value) {
    return !!array && array.indexOf(value) > -1;
  };
});
