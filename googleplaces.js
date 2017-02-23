var GooglePlaces = require('google-places');
 
var places = new GooglePlaces('AIzaSyD_-pH2q9RNua-TQ0Gp3Qkwx6UNJp6yMjs');
 
places.search({location: [-33.8670522,151.1957362],radius:500,type:"restaurant",keyword: 'hotels'}, function(err, response) {
  var arr = response.results;
  for(var i=0;i<arr.length;i++){
  	console.log(arr[i].vicinity);
  }
});
 
