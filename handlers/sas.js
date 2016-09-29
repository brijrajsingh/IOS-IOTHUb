var crypto = require('crypto');
var util = require('util');
var request = require('request');
var resourceUri = process.env.SBNAMESPACE || 'testagatsa.azure-devices.net/messages/events';
var signingKey = process.env.SENDERS_SHARED_ACCESS_KEY || 'jS9qxzF8V/lmCHcOaP9SykPQCIgCSVAjp9mNG4xCZ/o='; 
var policyName = process.env.SENDER_POLICY_NAME | 'device';
var expiresInMins = process.env.EXPIRY_IN_MINS | 60;


module.exports.getSASToken = function getSASToken(req, res) { 
 
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

function minutesFromNow(minutes) {
 var date = new Date();
 date.setMinutes(date.getMinutes() + minutes);
 return date;
 }
}