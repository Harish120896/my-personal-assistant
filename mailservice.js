	
module.exports = function(data,callback){
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
 
var transporter = nodemailer.createTransport(smtpTransport({
   service: 'Gmail',
   auth: {
       user: 'harishkumar120896@gmail.com',
       pass: 'dyhgxxzchdhdolqo'
   }
}));

let Mailoptions = {
	from: 'harishkumar120896@gmail.com',
	to: data.to,
	subject: data.subject,
	text: 'Hi, da eppdi iruka',
	html: '<b>'+data.body+'</b>'
};

transporter.sendMail(Mailoptions,function(error,info){
	if(error){
		callback("Sent failed");
	} else{
	callback("Mail sent successfully");}
});
}