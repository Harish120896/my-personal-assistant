module.exports = function(data,callback){
var NodeGeocoder = require('node-geocoder');
var gplaces = require('./googleplaces.js');
 
var options = {
  provider: 'google',
  // Optional depending on the providers 
  httpAdapter: 'https', // Default 
  apiKey: 'AIzaSyD_-pH2q9RNua-TQ0Gp3Qkwx6UNJp6yMjs', // for Mapquest, OpenCage, Google Premier 
  formatter: null         // 'gpx', 'string', ... 
};
 
var geocoder = NodeGeocoder(options);
 
// Using callback 
console.log(data);
geocoder.geocode(data.address, function(err, res) {
  if(err) throw err;
  var obj = res[0];
  obj.info = data.info;
  gplaces(obj,function(data){
    callback(data);
  });
});
}