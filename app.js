var builder = require('botbuilder');
var restify = require('restify');
var run = require('./hk.js');
var dict = require('./dictionary.js');
var weather = require('./weather.js');
var bmail = require('./mailservice.js');
var places = require('./geocoder.js');

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

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/8d2fa7c8-508c-483a-9ef6-91a9c21f866b?subscription-key=e09374baf0314b689fcb02d659b640e1&verbose=true';
var recognizer = new builder.LuisRecognizer(model);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });



bot.dialog('/',intents);

intents.matches(/^hi/i,[
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
		session.send('I am ur  Pal.. Feel free to ask me on updates..i will be here to help u with wat u want..');
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
intents.matches('GeneralNews',[function(session,args,next){
	console.log("haha");
	var ygeneral = builder.EntityRecognizer.findEntity(args.entities, 'general');
	console.log(ygeneral);
	if(ygeneral){
	var resulted;
	var search = 'general';
	run(search,function(data){
	resulted = data;
	var cards = resulted.articles.map(function(item){return createcard(session,item)});
	
    var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
    session.send(message);	
	});}
	else{
		session.beginDialog('/help');
	}
}
]);
intents.matches('OtherNews',[function(session,args,next){
var Ogeneral = builder.EntityRecognizer.findEntity(args.entities,'field');
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
		session.beginDialog('/help');
	}
}
]);
bot.dialog('/help',function(session){session.send("I am sorry buddy.I didn't get u.");
session.endDialog();
});
intents.matches('dictionary',[
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
intents.matches('weather-wah',[
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
intents.matches(/^help|Help/i,[
function(session){
	
	session.send("Hi There.. Here is ur Help..U can actually just keep it simple.. by asking directly ");
	session.send("say for Ex: sports for sports news,dictionary for finding meaning,mail for sending mail,weather for weather etc..");
	session.send('Hope u find it helpful');
}
]);
intents.matches(/^GoodBye|GoodByee|Good Byee|good byee|good bye|byee|Byee/i,[function(session){session.send("Good Byee buddy.Have a Nice Day");}]);
intents.onDefault([function(session){
	session.send("I am sorry buddy.I didn't get u.Type 'help' to let me help u..");
}]);
intents.matches('mail',[function(session,args,next){
	var result =  builder.EntityRecognizer.findEntity(args.entities,'mailid');
	console.log(result.entity);
	session.beginDialog('/mail');
	},
	function(session,results){
		var obj = results.response;
		obj['to'] = "saiharish120896@gmail.com";
		bmail(obj,function(response){
			session.send(response);
		});
	}
]);
intents.matches(/^Places|nearby places|Nearby places/i,[function(session,args,next){
	session.beginDialog('/places');
}
]);
function createcard(session,garray)
{
	var card = new builder.HeroCard(session);
	
	card.subtitle(garray.title);
	
	card.text(garray.description);
	
	card.images([builder.CardImage.create(session,garray.urlToImage)]);
	
	card.tap(builder.CardAction.openUrl(session,garray.url));
	
	return card;
}
bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, "What's your name?");
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);
// bot.dialog('/dictionary',[
// 	function(session){
// 		builder.Prompts.text(session,"what's the word?");
// 	},
// 	function(session,results){
// 		dict(results.response,function(data){
// 		var card = new builder.HeroCard(session);
// 		card.subtitle("MEANING");
// 		card.text(data);
// 		var message = new builder.Message(session).attachments([card]);
// 		session.send(message);
// 		session.endDialog();
// 		});
// 	},
// ]);
// bot.dialog('/weather',[
// 	function(session){
// 		builder.Prompts.text(session,"Enter the city plzz");
// 	},
// 	function(session,results){
// 		weather(results.response,function(data){
// 			var card = new builder.HeroCard(session);
// 			card.subtitle("WEATHER FORECAST");
// 			card.text('Today\'s Weather in '+data.location.name+' seems to be '+data.current.temperature+'F but it feels like '+data.current.feelslike+' F');
// 			card.images([builder.CardImage.create(session,data.current.imageUrl)]);
// 			var message = new builder.Message(session).attachments([card]);
// 			session.send(message);
// 			session.endDialog();
// 		});
// 	}
// ]);

var questions = [
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
            session.replaceDialog('/mail', session.dialogData);
        }
    }
]);

bot.dialog('/places',[
	function(session){
		builder.Prompts.text(session,"Enter the valid address");
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

function pcard(session,r)
{	
	console.log(r);
	var card = new builder.HeroCard(session);
	card.text("Restaurant Name:"+r.name);
	card.images([builder.CardImage.create(session,r.icon)]);
	card.subtitle("Address:"+r.vicinity);
	return card;
}
