var builder = require('botbuilder');
var restify = require('restify');
var run = require('./hk.js');
var dict = require('./dictionary.js');
var weather = require('./weather.js');
var bmail = require('./mailservice.js');
var places = require('./geocoder.js');
var search = require('./search.js');
var request = require('request').defaults({ encoding: null });
var url = require('url');
var validUrl = require('valid-url');
var needle = require('needle');
var captionService = require('./image-service');


var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}

var connector = new builder.ChatConnector(
{
	appId: '14f1be4d-a069-4d3f-9c6c-54534e9497bd',
    appPassword:'dThdAnVKvupXPw4WK1WvGUK'
}
);

var bot = new builder.UniversalBot(connector);
server.post('/api/messages',connector.listen());

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/d659c948-1e46-4790-9173-9d10755ea49e?subscription-key=792e4d9e18a649609e30a2f6481ed8a5&verbose=true&q=';
var recognizer = new builder.LuisRecognizer(model);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });



bot.dialog('/',intents);

intents.matches(/^hi|Hi|HI/i,[
function (session, args, next) {
        if (!session.userData.name) {
			session.send('Hi..there');
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hi.. %s!', session.userData.name);
		session.send('I am ur  pal.. feel free to ask me on updates.. i will be here to help u with what you want..');
    }
]);

intents.matches(/^change name/i,[
function (session) {
        session.beginDialog('/profile');
    },
    function (session, results) {
        session.send('Ok... Changed your name to %s', session.userData.name);
    }
]);

intents.matches('General News',[function(session,args,next){
	var search = 'general';
	run(search,function(data){
	resulted = data;
	var cards = resulted.articles.map(function(item){return createcard(session,item)});
	
    var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
    session.send(message);	
	});
}]);

intents.matches(/^other news/i,[function(session){
	session.beginDialog('/othernews');
},
function(session,results){
	console.log(results.response);
arrValues = ["sports","technology","tech","box office","games","gaming","minting","music","business","science","entertainment"];
var tell = arrValues.contains(results.response.entity);
console.log(results.response)
if(tell){
	var resulted;
	var search = results.response.entity;
	run(search,function(data){
	resulted = data;
	var cards = resulted.articles.map(function(item){return createcard(session,item)});
	
    var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
    session.send(message);	
	});}
	else{
		session.beginDialog('/other_news_help');
	}
}
]);



intents.matches('Other News',[function(session,args,next){
var Ogeneral = builder.EntityRecognizer.findEntity(args.entities,'other_news');
arrValues = ["sports","technology","tech","box office","games","gaming","minting","music","business","science","entertainment"];
var tell = arrValues.contains(Ogeneral.entity);
if(tell){
	var resulted;
	var search = Ogeneral.entity;
	run(search,function(data){
	resulted = data;
	var cards = resulted.articles.map(function(item){return createcard(session,item)});
	
    var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
    session.send(message);	
	});}
	else{
		session.beginDialog('/other_news_help');
	}
}
]);

intents.matches('Dictionary',[
	function(session,args,next){
		//session.beginDialog('/dictionary');
		var result =  builder.EntityRecognizer.findEntity(args.entities,'word');
		console.log(result);
		dict(result.entity,function(data){
		var card = new builder.HeroCard(session);
		card.subtitle("MEANING");
		card.text(data);
		var message = new builder.Message(session).attachments([card]);
		session.send(message);
		});
		}	
]);

intents.matches('Weather',[
	function(session,args,next){
		var result =  builder.EntityRecognizer.findEntity(args.entities,'place');
		console.log(result.entity);
		weather(result.entity,function(data){
		var card = new builder.HeroCard(session);
			card.subtitle("WEATHER FORECAST");
			card.text('Today\'s Weather in '+data.location.name+' seems to be '+data.current.temperature+'F but it feels like '+data.current.feelslike+' F');
			card.images([builder.CardImage.create(session,data.current.imageUrl)]);
			var message = new builder.Message(session).attachments([card]);
		session.send(message);
		//session.beginDialog('/weather');
	});
	}
]);

var rresult;
intents.matches('Mail',[function(session,args,next){
	rresult =  builder.EntityRecognizer.findEntity(args.entities,'mail_id');
	session.beginDialog('/mail');
	},
	function(session,results){
		var obj = results.response;
		var str = rresult.entity;
		obj['to'] = str.replace(/\s/g, '');
		bmail(obj,function(response){
			session.send(response);
		});
	}
]);

intents.matches(/^help|Help/i,[
function(session){
	
	session.send("Hi There.. I am PAL ur personal Assistant");
	session.send("u can get the following services from me");

}
]);



intents.matches(/^GoodBye|GoodByee|Good Byee|good byee|good bye|byee|Byee/i,[function(session){session.send("Good Byee buddy.Have a Nice Day");}]);

intents.onDefault([function(session){
	session.send("Oops something went wrong try again");
}]);

intents.matches(/^Places|find|find nearby|nearby places|Nearby places/i,[function(session,args,next){
	session.beginDialog('/places');
},
function(session,results){
		places(results.response,function(data){
			var cards=[];
			for (var i = 0;i < data.length;i++) {
				cards[i] = pcard(session,data[i]);
			}
    		var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
    		session.send(message);
			session.endDialog();
		});
	}
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, "What's your name?");
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

var question = [
//    { field: 'to', prompt: "Enter the receiver address" },
    { field: 'subject', prompt: "Enter the subject" },
    { field: 'body', prompt: "Enter the body content" }
];

bot.dialog('/mail', [
    function (session, args) {
        // Save previous state (create on first call)
        session.dialogData.index = args ? args.index : 0;
        session.dialogData.form = args ? args.form : {};

        // Prompt user for next field
        builder.Prompts.text(session, question[session.dialogData.index].prompt);
    },
    function (session, results) {
        // Save users reply
        var field = question[session.dialogData.index++].field;
        session.dialogData.form[field] = results.response;

        // Check for end of form
        if (session.dialogData.index >= question.length) {
            // Return completed form
            session.endDialogWithResult({ response: session.dialogData.form });
        } else {
            // Next field
            session.replaceDialog('/mail', session.dialogData);
        }
    }
]);

var questions = [
//    { field: 'to', prompt: "Enter the receiver address" },
    { field: 'address', prompt: "Enter the area's address?" },
    { field: 'info', prompt: "Enter the type of info u want?" }
];

bot.dialog('/places',[
	function (session, args) {
        // Save previous state (create on first call)
        session.dialogData.index = args ? args.index : 0;
        session.dialogData.form = args ? args.form : {};

        // Prompt user for next field
        builder.Prompts.text(session, questions[session.dialogData.index].prompt);
    },
    function (session, results) {
        // Save users reply
        var field = questions[session.dialogData.index++].field;
        session.dialogData.form[field] = results.response;

        // Check for end of form
        if (session.dialogData.index >= questions.length) {
            // Return completed form
            session.endDialogWithResult({ response: session.dialogData.form });
        } else {
            // Next field
            session.replaceDialog('/places', session.dialogData);
        }
    }
]);

bot.dialog('/othernews',[
	function (session, args) {
        builder.Prompts.choice(session, "What type of news do you want?", ["sports","technology","tech","box office","games","gaming","minting","music","business","science","entertainment"]);
    },
    function (session, results) {
        session.endDialogWithResult({response: results.response})
    }
]);

bot.dialog('/help',function(session){session.send("I am sorry buddy.I didn't get u.");
session.endDialog();
});

bot.dialog('/other_news_help',function(session){
	session.send("Oops,something is wrong.Try typing 'other news' for easy access");
	session.endDialog();
});
	
function createcard(session,garray)
{
	var card = new builder.HeroCard(session);
	
	card.subtitle(garray.title);
	
	card.text(garray.description);
	
	card.images([builder.CardImage.create(session,garray.urlToImage)]);
	
	card.tap(builder.CardAction.openUrl(session,garray.url));
	
	return card;
}

function pcard(session,r)
{	
	console.log(r);
	var card = new builder.HeroCard(session);
	card.text("Address:"+r.vicinity);
	card.images([builder.CardImage.create(session,r.icon)]);
	card.subtitle("Restaurant Name:"+r.name);
	return card;
}

intents.matches(/^Upload|upload|say me wats in the pic|say me what's in the picture|hey buddy get me what's in the picture/i,[function(session,args,next){
	session.beginDialog('/uploading');
}]);

bot.dialog('/uploading',[
	function(session){
		builder.Prompts.attachment(session, "Upload a picture for me to say .");
	},
	function(session,results){
		  if (hasImageAttachment(session)) {
        var stream = getImageStreamFromMessage(session.message);
        captionService
            .getCaptionFromStream(stream)
            .then(function (caption) { handleSuccessResponse(session, caption); })
            .catch(function (error) { handleErrorResponse(session, error); });
    } else {
        var imageUrl = parseAnchorTag(session.message.text) || (validUrl.isUri(session.message.text) ? session.message.text : null);
        if (imageUrl) {
            captionService
                .getCaptionFromUrl(imageUrl)
                .then(function (caption) { handleSuccessResponse(session, caption); })
                .catch(function (error) { handleErrorResponse(session, error); });
        } else {
            session.send('Did you upload an image? I\'m more of a visual person. Try sending me an image or an image URL');
        }
    }
}
]);


function hasImageAttachment(session) {
    return session.message.attachments.length > 0 &&
        session.message.attachments[0].contentType.indexOf('image') !== -1;
}

function getImageStreamFromMessage(message) {
    var headers = {};
    var attachment = message.attachments[0];
    if (checkRequiresToken(message)) {
        // The Skype attachment URLs are secured by JwtToken,
        // you should set the JwtToken of your bot as the authorization header for the GET request your bot initiates to fetch the image.
        // https://github.com/Microsoft/BotBuilder/issues/662
        connector.getAccessToken(function (error, token) {
            var tok = token;
            headers['Authorization'] = 'Bearer ' + token;
            headers['Content-Type'] = 'application/octet-stream';

            return needle.get(attachment.contentUrl, { headers: headers });
        });
    }

    headers['Content-Type'] = attachment.contentType;
    return needle.get(attachment.contentUrl, { headers: headers });
}

function checkRequiresToken(message) {
    return message.source === 'skype' || message.source === 'msteams';
}

/**
 * Gets the href value in an anchor element.
 * Skype transforms raw urls to html. Here we extract the href value from the url
 * @param {string} input Anchor Tag
 * @return {string} Url matched or null
 */
function parseAnchorTag(input) {
    var match = input.match('^<a href=\"([^\"]*)\">[^<]*</a>$');
    if (match && match[1]) {
        return match[1];
    }

    return null;
}

//=========================================================
// Response Handling
//=========================================================
function handleSuccessResponse(session, caption) {
    if (caption) {
        session.send('I think it\'s ' + caption);
        session.endDialog();
    }
    else {
        session.send('Couldn\'t find a caption for this one');
        session.endDialog();
    }

}

function handleErrorResponse(session, error) {
    session.send('Oops! Something went wrong. Try again later.');
    console.error(error);
}




