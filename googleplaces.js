module.exports = function(data,callback){
var GooglePlaces = require('google-places');
 
var places = new GooglePlaces('AIzaSyD_-pH2q9RNua-TQ0Gp3Qkwx6UNJp6yMjs');
 
places.search({location: [data.latitude,data.longitude],radius:500,type:"restaurant",keyword: data.info}, function(err, response) {
  var arr = response.results;
  callback(arr);
});
};

