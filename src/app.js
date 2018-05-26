import droneSynth from './drone'
import granularSynth from './granular'

// TODO There is probably a better, more Webpack-ish way to expose entry points
window.droneSynth = droneSynth
window.granularSynth = granularSynth
