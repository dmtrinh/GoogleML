var express = require('express');
var request = require('request');
var path = require('path');

var app = express();

const PORT = 8080;
const CX   = "";
const KEY  = "";

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/search', function(req, res) {
  var query = req.query.q;

  var parametersObj = { 
    q: query,
    cx: CX,
    key: KEY,
  };

  console.log("Processing action /search");
  //res.send("FooBar!");

  request.get({
    url: 'https://www.googleapis.com/customsearch/v1',
    qs: parametersObj
  }, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      console.error('ERROR!', error || body);
    }
    else {
      var payload = JSON.parse(body);
      //console.log('SUCCESS!', payload);
      console.log('SUCCESS - Invocation to CustomSearch');
      console.log('----');

      var items = payload.items;
      if ( items ) {
          var link = items[0].link;
          //res.redirect(link);
          res.set({'X-Frame-Options': 'ALL'});
          res.send(link);
      }
    }
  });
});

app.listen(PORT);
console.log('Listening on ' + PORT);
