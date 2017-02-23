function getCall() {
    var https = require('https');
    var readline = require('readline');

    const r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    r1.question('tell me the word?',function(answer){
        console.log(answer);
        var options = {
        host :  'od-api.oxforddictionaries.com',
        port : 443,
        path : '/api/v1/entries/en/'+answer,
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
            console.log(result.results[0].lexicalEntries[0].entries[0].senses[0].definitions);
        });
    });
 
    //end the request
    getReq.end();
    getReq.on('error', function(err){
        return err;
    });
    r1.close();
    });
    //initialize options values, the value of the method can be changed to POST to make https post calls
     
}
 
getCall();
