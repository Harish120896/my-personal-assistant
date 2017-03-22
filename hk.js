module.exports = function(data,callback){
	var https = require('https');
//source=bbc-sport&sortBy=top&apiKey=3f768af8fd2948ac888206fd6fe4f889
var querystring = require('querystring');

Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)]
}

var marray = {};
marray['tech']=['techcrunch','recode'];
marray['general']=['the-hindu','bbc-news'];
marray['technology']=['techcrunch','recode'];
marray['sports']=['bbc-sport','talksport'];
marray['business']=['business-insider','cnbc'];
marray['minting']=['business-insider','cnbc'];
marray['entertainment']=['mashable','the-lad-bible'];
marray['box office']=['mashable','the-lad-bible'];
marray['gaming']=['polygon','ign'];
marray['games']=['polygon','ign'];
marray['music']=['mtv-news'];
marray['science']=['national-geographic','new-scientist'];

var selected = data;

var source = marray[selected].randomElement();

var rempath = querystring.stringify(
{
	'source':source,
	'sortBy':'top',
	'apikey':'3f768af8fd2948ac888206fd6fe4f889'
}
);


function getCall() {
    //initialize options values, the value of the method can be changed to POST to make https post calls
    var options = {
        host :  'newsapi.org',
        port : 443,
        path : '/v1/articles?'+rempath,
        method : 'GET'
    }
	console.log("up to now ok");
 
    //making the https get call
    var getReq = https.request(options, function(res) {
        console.log("\nstatus code: ", res.statusCode);
        var data = "";
		res.on('data', function(chunk) {
             data +=  chunk;
        });
		res.on('end',function(){
			callback(JSON.parse(data));
		});
    });
 
    //end the request
    getReq.end();
    getReq.on('error', function(err){
        return err;
    }); 
}
 
getCall();
}