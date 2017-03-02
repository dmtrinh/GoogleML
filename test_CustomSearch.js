var request = require('request');

var queryString = "";
var cx = "";
var key = "";

var parametersObj = { 
  q: queryString,
  cx: cx,
  key: key,
};

request.get({
  url: 'https://www.googleapis.com/customsearch/v1',
  qs: parametersObj
}, function(error, response, body) {
  if (error || response.statusCode !== 200) {
    console.error('ERROR!', error || body);
  }
  else {
    var payload = JSON.parse(body);
    console.log('SUCCESS!', payload);
    console.log('---------');
    var items = payload.items;
    console.log(items);
    for (var i=0, size = items.length; i < size; i++) {
      console.log('---------');
      console.log(items[i]);
    }
  }
});
