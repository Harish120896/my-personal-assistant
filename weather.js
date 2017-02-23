module.exports = function(data,callback){
var weather = require('weather-js');
 
// Options: 
// search:     location name or zipcode 
// degreeType: F or C 
 
weather.find({search: data+', India', degreeType: 'F'}, function(err, result) {
  if(err) console.log(err);
  var data = JSON.stringify(result, null, 2);
  var data = JSON.parse(data);
  callback(data[0]);
});
};