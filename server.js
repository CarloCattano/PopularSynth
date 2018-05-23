var express = require('express');
var app = express();
var server = require('http').createServer(app);

server.listen(8080);

app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/home.html');
});
app.get('/drone', function (req, res, next) {
    res.sendFile(__dirname + '/public/Drone_synth.html');
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
