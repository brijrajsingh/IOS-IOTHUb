var express = require('express');
var app = express();
require('./route.js')(app);
app.listen(process.env.PORT || 3000, function() {
 console.log('express app started');
});