var builder = require('botbuilder');
var restify = require('restify');
var run = require('./hk.js');
var dict = require('./dictionary.js');
var weather = require('./weather.js');

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

var model = 'https://api.projectoxford.ai/luis/v2.0/apps/44cfa56f-3893-43c4-8f1e-00712b40523c?subscription-key=08bf84c2bc0b4264bf62f4f06d6c5731&verbose=true';
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
		session.send('I am ur news bot.. Feel free to ask me on updates..i will be here to help u with wat u want..');
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
	var ygeneral = builder.EntityRecognizer.findEntity(args.entities, 'general');
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
bot.dialog('/help',function(session){session.send("I am sorry buddy.I didn't get u.Type type general or sports or music or business or entertainment or technology to get u news related to it..in turn u can also use natural statements like..Ex: hey buddy what's on the top chart or like what's trending on sports etc..");
session.endDialog();
});
intents.matches(/^Dictionary|dictionary/i,[
	function(session,args,next){
		session.beginDialog('/dictionary');
	}
]);	
intents.matches(/^Weather|weather/i,[
	function(session,args,next){
		session.beginDialog('/weather');
	}
]);
intents.matches(/^help|Help/i,[
function(session){
	
	session.send("Hi There.. Here is ur Help..U can actually just ");
	session.send('Hope u find it helpful');
}
]);
intents.matches(/^GoodBye|GoodByee|Good Byee|good byee|good bye|byee|Byee/i,[function(session){session.send("Good Byee buddy.Have a Nice Day");}]);
intents.onDefault([function(session){
	session.send("I am sorry buddy.I didn't get u.Type 'help' to let me help u..");
}]);

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
bot.dialog('/dictionary',[
	function(session){
		builder.Prompts.text(session,"what's the word?");
	},
	function(session,results){
		dict(results.response,function(data){
		var card = new builder.HeroCard(session);
		card.subtitle("MEANING");
		card.text(data);
		var message = new builder.Message(session).attachments([card]);
		session.send(message);
		session.endDialog();
		});
	},
]);
bot.dialog('/weather',[
	function(session){
		builder.Prompts.text(session,"Enter the city plzz");
	},
	function(session,results){
		weather(results.response,function(data){
			var card = new builder.HeroCard(session);
			card.subtitle("WEATHER FORECAST");
			card.text('Today\'s Weather in '+data.location.name+' seems to be '+data.current.temperature+'F but it feels like '+data.current.feelslike+' F');
			card.images([builder.CardImage.create(session,data.current.imageUrl)]);
			var message = new builder.Message(session).attachments([card]);
			session.send(message);
			session.endDialog();
		});
	}
]);
