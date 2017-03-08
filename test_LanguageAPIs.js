/**
 * Demonstrates how to authenticate using a JSON web token (JWT) and
 * invoke Google's Natural Language API 
 */
var google = require('googleapis');
var config = require('config');

var googleLangApi = google.language('v1');

var key = require(config.get('JWT'));
var jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/cloud-platform'],
  null
);


// Specify Experiment configuration
var requestBody = {
  'document': { 
      'type': 'PLAIN_TEXT',
      'content': 'Look up all my transactions last month at StarBucks.'
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
  if (err)
    console.log(err);
  else {
    console.log(JSON.stringify(resp, null, 2));
    console.log('----------');
    console.log(resp.entities[0]);
  }
});


