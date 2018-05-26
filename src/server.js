import express from 'express'
import http from 'http'
import path from 'path'

import synthTemplate from './sampler/index.html'

const synthUrl = path.join(__dirname, synthTemplate)

var app = express();
var server = http.createServer(app);

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
    res.sendFile(synthUrl);
});
app.get('/drone/:role', function (req, res, next) {
    res.sendFile(synthUrl);
});
app.get('/granular', function (req, res, next) {
    res.sendFile(synthUrl);
});
app.get('/sampler', function (req, res, next) {
    res.sendFile(synthUrl);
});

app.use(express.static(__dirname))

server.listen(port);
