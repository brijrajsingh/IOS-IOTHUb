var crypto = require('crypto');
var util = require('util');
var request = require('request');
var sbNamespace = process.env.SBNAMESPACE || 'iothub-ns-agatsaioth-71484-b43323dbe7';
var sbEntityPath = process.env.SBENTITYPATH || 'agatsaiothub1';
var sharedAccessKey = process.env.SENDERS_SHARED_ACCESS_KEY_1 || 'JdhR+tX5TO1r1KYnwS7sLEWIRruYNg68JSlqZEWuEyk='; 
var sharedAccessKeyName = process.env.SENDER_SHARED_ACCESS_NAME_1 || 'iothubowner';

module.exports.getSASToken = function getSASToken(req, res) { 
 var uri = "https://" + sbNamespace + 
 ".servicebus.windows.net/" + sbEntityPath + "/publishers/iosDevice/messages";
var encodedResourceUri = encodeURIComponent(uri);
var expireInSeconds = Math.round(minutesFromNow(30) / 1000);
var plainSignature = encodedResourceUri + "\n" + expireInSeconds;
var signature = crypto.createHmac('sha256', sharedAccessKey)
 .update(plainSignature)
 .digest('base64');
var sas = util.format('SharedAccessSignature sig=%s&se=%s&skn=%s&sr=%s', 
 encodeURIComponent(signature), expireInSeconds, sharedAccessKeyName, encodedResourceUri);;
 console.log(sas);
 res.send(sas);
function minutesFromNow(minutes) {
 var date = new Date();
 date.setMinutes(date.getMinutes() + minutes);
 return date;
 }
}