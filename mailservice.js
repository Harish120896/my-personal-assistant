	
module.exports = function(mail,callback){
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
 
var transporter = nodemailer.createTransport(smtpTransport({
   service: 'Gmail',
   auth: {
       user: '@gmail.com',
       pass: 'dyhgxxzchdhdolqo'
   }
}));

let Mailoptions = {
	from: 'harishkumar120896@gmail.com',
	to: 'gowtham4466@gmail.com',
	subject: 'mail sent from harish',
	text: 'Hi, da eppdi iruka',
	html: '<b>hello world!</b>'
};

transporter.sendMail(Mailoptions,function(error,info){
	if(error){
		return console.log(error);
	} 
	console.log("Mail sent successfully");
});
}