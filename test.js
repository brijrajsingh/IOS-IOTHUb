var https = require('https');

var crypto = require('crypto');



// Event Hubs parameters

/*var namespace = 'iothub-ns-testagatsa-71798-cf1e6b8443';

var hubname ='testagatsa';

var devicename = 'device-02';


//sb://iothub-ns-testagatsa-71798-cf1e6b8443.servicebus.windows.net/
//Id,PrimaryKey,SecondaryKey,ConnectionString,ConnectionState,LastActivityTime,LastConnectionStateUpdatedTime,LastStateUpdatedTime,MessageCount,State,SuspensionReason
//device-01,7X9HayfSHcpK0Oy2y9sJW0COhh1Lc7q1/e0EwQkpMmk=,f/KJmARBS8qNVRDd9SzLvbfmmcwWzcv25lwpC0uIkKY=,
//HostName=testagatsa.azure-devices.net;DeviceId=device-01;SharedAccessKey=7X9HayfSHcpK0Oy2y9sJW0COhh1Lc7q1/e0EwQkpMmk=,Disconnected,1/1/0001 12:00:00 AM,1/1/0001 12:00:00 AM,1/1/0001 12:00:00 AM,0,//Enabled,

// Payload to send

var payload = '{\"Temperature\":\"37.0\",\"Humidity\":\"0.4\"}';



// Shared access key (from Event Hub configuration)

var my_key_name = 'device';

var my_key = 'jS9qxzF8V/lmCHcOaP9SykPQCIgCSVAjp9mNG4xCZ/o=';



// Full Event Hub publisher URI

var my_uri = 'https://' + namespace + '.servicebus.windows.net' + '/' + hubname + '/publishers/' + devicename + '/messages';



// Create a SAS token

// See http://msdn.microsoft.com/library/azure/dn170477.aspx



function create_sas_token(uri, key_name, key)

{

    // Token expires in 24 hours

    var expiry = Math.floor(new Date().getTime()/1000+3600*24);

    var string_to_sign = encodeURIComponent(uri) + '\n' + expiry;

    var hmac = crypto.createHmac('sha256', key);

    hmac.update(string_to_sign);

    var signature = hmac.digest('base64');

    var token = 'SharedAccessSignature sr=' + encodeURIComponent(uri) + '&sig=' + encodeURIComponent(signature) + '&se=' + expiry + '&skn=' + key_name;

    return token;

}



var my_sas = create_sas_token(my_uri, my_key_name, my_key)

console.log(my_sas);*/

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

var my_sas = generateSasToken(my_uri, signingKey,policyName,60);

console.log(my_sas);

// Send the request to the Event Hub
var options = {

  hostname: 'testagatsa.azure-devices.net',

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



