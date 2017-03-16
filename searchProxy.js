var express = require('express');
var request = require('request');
var config = require('config');
var path = require('path');

var app = express();

const PORT = 8080;
const CX   = config.get('CustomSearchCX');
const KEY  = config.get('APIKey');

var google = require('googleapis');
var googleLangApi = google.language('v1');

var key = require(config.get('JWT'));
var jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/cloud-platform'],
  null
);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/search', function(req, res) {
  var query = req.query.q;

  console.log("Processing action /search");
  //res.send("FooBar!");

  invokeNaturalLanguageAPI(query, function(results) {
    console.log("Invoking Natural Language API...");
    if (results) {
      console.log("... SUCCESS!");
      console.log('----------');
      console.log(JSON.stringify(results, null, 2));

      var rawEntities = results.entities;
      var filtered = [];

      // We are only interested in entities with relatively high importance
      for (var i=0; i < rawEntities.length && i < 3; i++) {
        if (rawEntities[i].salience > 0.5) {
          filtered.push(rawEntities[i].name);
        }
      }
      console.log("Significant entities: " + filtered);

      // FIX ME This is a hack - we are not ending the response and are assuming
      // the Natural Language invocation will take longer to complete than the
      // Custom Search invocation!
      res.write('<p>Significant entities: ' + filtered + '</p>');
    }
  })

  invokeCustomSearchAPI(query, function(error, response, body) {
    console.log("Invoking CustomSearch API...")
    if (error || response.statusCode !== 200) {
      console.error('ERROR!', error || body);
    }
    else {
      var payload = JSON.parse(body);
      var items = payload.items;

      if ( items ) {

        console.log("... SUCCESS!  Found " + items.length + " results.");
        console.log("... Returning top result: " + items[0].title);
        var link = items[0].link;
        //res.redirect(link);
        //res.set({'X-Frame-Options': 'ALL'});
        res.write('<p><a href=' + link + ' target="_blank">' + items[0].title + '</a></p>');
        res.end();
      }
    }
  });
});

app.listen(PORT);
console.log('Listening on ' + PORT);

function invokeNaturalLanguageAPI(content, callback) {
  var requestBody = {
    'document': { 
        'type': 'PLAIN_TEXT',
        'content': content
    },
    'features': {
        'extractEntities': true,
        'extractDocumentSentiment': true,
        'extractSyntax': true
    },
    'encodingType': 'UTF8'
  };

  googleLangApi.documents.annotateText({
    auth: jwtClient,
    resource: requestBody
  }, function (err, resp) {
    if (err) {
      console.log(err);
      callback(err);
    } else
      callback(resp);
  });
}

function invokeCustomSearchAPI(query, callback) {
  var parametersObj = { 
    q: query,
    cx: CX,
    key: KEY,
  };

  request.get({
    url: 'https://www.googleapis.com/customsearch/v1',
    qs: parametersObj
  }, function(error, response, body) {
    callback(error, response, body);
  });
}