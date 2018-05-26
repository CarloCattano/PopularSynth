import droneSynth from './drone'
import granularSynth from './granular'
import samplerSynth from './sampler'

// TODO There is probably a better, more Webpack-ish way to expose entry points
window.droneSynth = droneSynth
window.granularSynth = granularSynth

const synths = [{
  re: /\/sampler$/,
  build: samplerSynth
}]
window.loadSynthFromUrl = url => {
  synths.find(synth => {
    const match = synth.re.exec(url)
    if (match) {
      debugger
      synth.build(match.groups)
      return true
    }
    return false
  })
}

document.documentElement.addEventListener(
  "mousedown",
  function () {
    if (Tone.context.state !== 'running') {
      Tone.context.resume();
    }
  }
)
