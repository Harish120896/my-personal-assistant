module.exports = function(data,callback){
    function getCall() {
    var https = require('https');
        var options = {
        host :  'od-api.oxforddictionaries.com',
        port : 443,
        path : '/api/v1/entries/en/'+data,
        method : 'GET',
        headers : {
                    "Accept": "application/json",
                    "app_id": "cf444182",
                    "app_key": "3f1d0b8164126740d64020a1446e1406"
                   }
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
            var result = JSON.parse(data);
            callback(result.results[0].lexicalEntries[0].entries[0].senses[0].definitions);
        });
    });
 
    //end the request
    getReq.end();
    getReq.on('error', function(err){
        return err;
    });
    //initialize options values, the value of the method can be changed to POST to make https post calls
     
}
 
getCall();

};
