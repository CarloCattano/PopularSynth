var express = require('express');
var app = express();
var server = require('http').createServer(app);

function* infiniteIteration (array) {
  let i = -1
  while (true) {
    ++i
    yield array[i % array.length]
  }
}

const port = process.env.NODE_PORT || 80

const synthRoutes = [
  '/drone/sin',
  '/drone/saw',
  '/drone/square',
  '/granular',
  '/sampler'
]

const synthRoute = infiniteIteration(synthRoutes)

app.get('/', function (req, res, next) {
  res.redirect(synthRoute.next().value)
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

server.listen(port);
