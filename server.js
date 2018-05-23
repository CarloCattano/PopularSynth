var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var myClients = [];

function logConnectedClientsCount () {
  console.log(`Connected ${myClients} ${myClients.length} clients`)
}

server.listen(8080);
app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/home.html');
});
app.get('/drone/:role', function (req, res, next) {
    res.sendFile(__dirname + '/public/Drone_synth.html');
});
app.get('/granular', function (req, res, next) {
    res.sendFile(__dirname + '/public/Granular_synth.html');
});
app.get('/sampler', function (req, res, next) {
    res.sendFile(__dirname + '/public/Sampler.html');
});
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {
    myClients.push(socket.id);
    socket.on('disconnect', function () {
        let gone = myClients.indexOf(socket.id);
        myClients.splice(gone, 1); // this method works perfectly for now
        //console.log("disconected " + gone);   // listen for connected clients
        logConnectedClientsCount();
        socket.emit('clientsIDS', myClients);
    });
    socket.emit('clientsIDS', myClients);
    logConnectedClientsCount()
});
