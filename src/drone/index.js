import Tone from 'tone'

function roleFromCurrentUrl () {
  const match = /(sin|saw|square)+$/.exec(window.location)
  return match ? match[0] : 'sin'
}

export default () => {
  function lfo2range(){
    lfo2.min = Math.abs(cutoffPos - lfo2Range);
    lfo2.max = cutoffPos + lfo2Range;
  }

  var playTeam = roleFromCurrentUrl();
  var myId;
  var cutoffPos = 500;
  var oscillators = [];
  var bassFreq = 32;
  //// AUDIO MASTER
  // var filter2 = new Tone.Filter(1, "lowpass", -24).toMaster();
  var filter1 = new Tone.Filter(1, "lowpass", -24).toMaster();
  var reverb =  new Tone.JCReverb(0.8).connect(filter1);
  var vibrato = new Tone.Vibrato(0, 0.8).connect(reverb);
  var delay =   new Tone.FeedbackDelay(0.200, 0.6).connect(vibrato);
  //// FX PARAMS
  filter1.Q.value = 0.4;
  filter1.gain.value = 0.35;
  reverb.wet.value = 0.8;

  Tone.context.latencyHint = "balanced";  // "balanced" "playback" "interactive"

  /// LFO
  var lfo2Range = 500;
  var lfo2 = new Tone.LFO("4hz", cutoffPos, lfo2Range).stop();
  lfo2.connect(filter1.frequency);        //LFO --> FILTER FREQ.

  /// ASSIGNMENT FUNCTION ON STARTUP
  switch (playTeam) {
    case 'sin':
      for (var i = 0; i < 4; i++) {
        oscillators.push(new Tone.Oscillator({
          "frequency": bassFreq * i,
          "type": "sine",
          "volume": -Infinity,
          "detune": Math.random() * 10,}).start().connect(delay));
      };
      document.getElementById("Explanation").innerHTML = "You are A Sine wave";
      break;

    case 'saw':
      //  Main Oscillators array
      for (var i = 0; i < 4; i++) {
        oscillators.push(new Tone.Oscillator({
          "frequency": bassFreq * i,
          "type": "sawtooth10",
          "volume": -Infinity,
          "detune": Math.random() * 10,}).start().connect(delay));
      };
      document.getElementById("Explanation").innerHTML = "You are A Saw wave!";
      break;

    case 'square':
        for (var i = 0; i < 4; i++) {
          oscillators.push(new Tone.Oscillator({
            "frequency": bassFreq * i,
            "type": "square",
            "volume": -Infinity,
            "detune": Math.random() * 10,}).start().connect(delay));
        };
        document.getElementById("Explanation").innerHTML = "You are a Square Wave!";
        break;
    }

  ///INTERFACES
  Interface.Slider({
          name: "Pitch",
          min: 0.5,
          max: 3.0,
          initial: 1,
          value: 1,
      drag: function (value) {
          switch (playTeam) {
              case 'sin':
              oscillators.forEach(function (osc, i) {
                  osc.frequency.rampTo(4 * (bassFreq * i * value), 0.2);
              });
               break;

          case 'saw':
              oscillators.forEach(function (osc, i) {
                  osc.frequency.rampTo(bassFreq * i * value, 0.2);
              });
              break;

           case 'square':
              oscillators.forEach(function (osc, i) {
                  osc.frequency.rampTo(2 * (bassFreq * i * value), 0.2);
              });
              break;
          }
      }
  });
  Interface.Slider({
      tone: filter1,
      param: "frequency",
      axis: "x",
      initial: 200,
      min: 10,
      max: 20000,
      exp: 3,
      drag: function (value) {
          cutoffPos = filter1.frequency.value;
           lfo2range();
      },
  });
  Interface.Slider({
      param: "frequency",
      name: "AM",
      tone: vibrato,
      axis: "x",
      min: 0,
      max: 15,
      value: 0,
      initial: 0,
      drag: function (value) {
          vibrato.depth.value = value / 15;
          delay.delayTime.rampTo(value / 15, 0.5);
          delay.feedback.rampTo(value / 15 - 0.1, 0.5);
      },
  });
  Interface.Button({
      text: "Play",
      activeText: "Stop",
      type: "toggle",
      start: function () {
          oscillators.forEach(function (osc) {
              osc.volume.rampTo(-28, 0.25);
          });
      },
      end: function () {
          oscillators.forEach(function (osc) {
              osc.volume.rampTo(-Infinity, 0.25);
          });
      },
  });
  Interface.Button({
      text: "OFF",
      activeText: "lfo on",
      type: "toggle",
      start: function () {
          lfo2.start();
      },
      end: function () {
          lfo2.stop();
      },
  });
  Interface.Slider({
      name: "Speed LFO",
      min: 0.01,
      max: 30,
      exp: 2.5,
      value: 1,
      drag: function (value) {
          lfo2.frequency.rampTo(value, 0.1);
      },
  });
  Interface.Slider({
      name: "LFO Range",
      min: 50,
      max: 2000,
      exp: 2.5,
      value: 1500,
      drag: function (value) {
          lfo2Range = value;
          lfo2range();
      },
  });
}
