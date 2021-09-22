var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('listening to %s', server.url);
});

var connector = new builder.ChatConnector({ appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD });
server.post('/api/messages', connector.listen());

var inMemoryStorage = new builder.MemoryBotStorage();
var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.send("Hello and welcome.");
        builder.Prompts.time(session, "Please provide the delivery date and time (e.g.: June 6th at 5pm)");
    },
    function (session, results) {
        session.dialogData.orderDate = builder.EntityRecognizer.resolveTime([results.response]);
        builder.Prompts.text(session, "What you would like to order ? (Pizza/ice-cream/coke)");
    },
    function (session, results) {
        session.dialogData.orderItem = results.response;
        builder.Prompts.text(session, "Whose name will this order be under?");
    },
    function (session, results) {
        session.dialogData.reservationName = results.response;
        builder.Prompts.text(session, "Please provide the address for delivery.");
        
    },
    function (session, results) {
        session.dialogData.address = results.response;
        session.send(`Order confirmed! Order details: Date/Time: ${session.dialogData.orderDate} Order item: ${session.dialogData.orderItem} Customer name: ${session.dialogData.reservationName} Address for delivery: ${session.dialogData.address}`);
        session.endDialog();

    }
]).set('storage', inMemoryStorage);