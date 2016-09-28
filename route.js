var sasHandler = require('./handlers/sas.js');
module.exports = function(app){ 
 app.get('/sas', sasHandler.getSASToken);
}