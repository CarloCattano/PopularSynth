import express from 'express'
import http from 'http'
import path from 'path'

import droneSynth from '../public/Drone_synth.html'
import granularSynth from '../public/Granular_synth.html'
import samplerSynth from '../public/Sampler.html'

const droneSynthPath = path.join(__dirname, droneSynth)
const granularSynthPath = path.join(__dirname, granularSynth)
const samplerSynthPath = path.join(__dirname, samplerSynth)

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
    res.sendFile(droneSynthPath);
});
app.get('/drone/:role', function (req, res, next) {
    res.sendFile(droneSynthPath);
});
app.get('/granular', function (req, res, next) {
    res.sendFile(granularSynthPath);
});
app.get('/sampler', function (req, res, next) {
    res.sendFile(samplerSynthPath);
});

app.use(express.static(__dirname))

server.listen(port);
