var https = require('https');
var crypto = require('crypto');


var my_uri = 'testagatsa.azure-devices.net/messages/events';
var signingKey = 'jS9qxzF8V/lmCHcOaP9SykPQCIgCSVAjp9mNG4xCZ/o=';
var policyName = 'device';
// Payload to send
var payload = '{\"Temperature\":\"37.0\",\"Humidity\":\"0.4\"}';


var generateSasToken = function(resourceUri, signingKey, policyName, expiresInMins) {
    resourceUri = encodeURIComponent(resourceUri.toLowerCase()).toLowerCase();

    // Set expiration in seconds
    var expires = (Date.now() / 1000) + expiresInMins * 60;
    expires = Math.ceil(expires);
    var toSign = resourceUri + '\n' + expires;

    // using crypto
    var decodedPassword = new Buffer(signingKey, 'base64').toString('binary');
    const hmac = crypto.createHmac('sha256', decodedPassword);
    hmac.update(toSign);
    var base64signature = hmac.digest('base64');
    var base64UriEncoded = encodeURIComponent(base64signature);

    // construct autorization string
    var token = "SharedAccessSignature sr=" + resourceUri + "&sig="
    + base64UriEncoded + "&se=" + expires;
    if (policyName) token += "&skn="+policyName;
    console.log("signature:" + token);
    return token;
};

//var my_sas = generateSasToken(my_uri, signingKey,policyName,60);

//var my_sas = 'SharedAccessSignature sr=testagatsa.azure-devices.net%2fmessages%2fevents&sig=zRFEPG%2B%2FNbwSs%2BCHZDnfDWjJjUpbsKCoEE9x0CIl%2FKM%3D&se=1475165641&skn=device';

var my_sas = 'SharedAccessSignature sr=agatsaiothub1.azure-devices.net%2fmessages%2fevents&sig=foMy%2Fr71vkE42PNIhGfwg7zo86Uzkb8ncqCuL8CWnqE%3D&se=1475336032&skn=device';


console.log(my_sas);

// Send the request to the Event Hub
var options = {

  hostname: 'agatsaiothub1.azure-devices.net',

  path: '/devices/device-01/messages/events?api-version=2016-02-03',

  method: 'POST',

  headers: {

    'Authorization': my_sas,

    'Content-Length': payload.length,

    'Content-Type': 'application/atom+xml;type=entry;charset=utf-8'

  }

};



var req = https.request(options, function(res) {

  console.log("statusCode: ", res.statusCode);

  console.log("headers: ", res.headers);



  res.on('data', function(d) {

    process.stdout.write(d);

  });

});



req.on('error', function(e) {

  console.error(e);

});



req.write(payload);

req.end();



