import droneSynth from './drone'
import granularSynth from './granular'
import samplerSynth from './sampler'

const synths = [{
  re: /\/drone(?:\/(.*))?$/,
  build: match => {
    droneSynth(match[1])
  }
},
{
  re: /\/granular$/,
  build: granularSynth
}, {
  re: /\/sampler$/,
  build: samplerSynth
}]
window.loadSynthFromUrl = url => {
  synths.find(synth => {
    const match = synth.re.exec(url)
    if (match) {
      synth.build(match)
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
