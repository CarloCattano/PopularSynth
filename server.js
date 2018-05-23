var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var myClients = [];

server.listen(8080);
app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/home.html');
});
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {
    myClients.push(socket.id);
    socket.on('disconnect', function () {
        let gone = myClients.indexOf(socket.id);
        myClients.splice(gone, 1); // this method works perfectly for now
        //console.log("disconected " + gone);   // listen for connected clients
        clientsNbr = myClients.length;
        console.log("conected " + myClients + " "+ clientsNbr + " clients");
        socket.emit('clientsIDS', myClients);
    });
    clientsNbr = myClients.length;
    socket.emit('clientsIDS', myClients);
    console.log("conected " + myClients + " "+ clientsNbr + " clients");
});
