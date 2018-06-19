import Tone from 'tone'
window.Tone = Tone

import amb1Url from './amb1.mp3'

export default () => {
  var cutoffPos = 500;
  //// AUDIO MASTER
  var filter1 = new Tone.Filter(500, "lowpass", -24).toMaster();
  var reverb = new Tone.JCReverb(0.5).connect(filter1);
  var delay = new Tone.FeedbackDelay(0.25, 0).connect(reverb);
  //// FX PARAMS
  filter1.Q.value = 0.3;
  filter1.gain.value = 0.35;
  reverb.wet.value = 0.5;

  var lfo2Range = 500;
  var lfo2 = new Tone.LFO("4hz", cutoffPos, lfo2Range).stop();
  lfo2.connect(filter1.frequency);
  Tone.context.latencyHint = "playback";  // "balanced" "playback" "interactive"

  // GUI

  $('#Title').text('48h sound')
  $('#Explanation').text('Granular')

  const sliders = document.createElement("div")
  const fxSliders = document.createElement("div")
  const output = document.createElement("output")
  $('#Content').append(sliders)
  $('#Content').append(fxSliders)
  $('#Content').append(output)

  Interface.Slider({
      parent : fxSliders,
      tone: filter1,
      param: "frequency",
      axis: "x",
      initial: 15000,
      min: 60,
      max: 20000,
      exp: 5,
      drag: function (value) {
           lfo2range();
      },
  });
  Interface.Slider({
      name : delay,
      parent : fxSliders,
      tone: delay,
      param: "feedback",
      axis: "x",
      initial: 0.4,
      min: 0,
      max: 0.97,
  });
  Interface.Button({
      parent : fxSliders,
      text: "lfo off",
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
       parent : fxSliders,
      name: "Speed LFO",
      min: 0.01,
      max: 30,
      exp: 2.5,
      value: 1,
      drag: function (value) {
          lfo2.frequency.rampTo(value, 0.2);
      },
  });
  Interface.Slider({
      parent : fxSliders,
      name: "LFO Range",
      min: 2,
      max: 1000,
      exp: 1,
      value: 10,
      drag: function (value) {
          lfo2Range = value;
          lfo2range();
      },
  });
  function lfo2range(){
          lfo2.min =  Math.abs(cutoffPos-lfo2Range);
          lfo2.max = cutoffPos + lfo2Range;
         // console.log(cutoffPos + " hz " + lfo2.min+" min " + lfo2.max + " max");
  }
  //the player
  var player = new Tone.GrainPlayer({
          "url" : amb1Url,
          "loop" : true,
          "grainSize" : 0.1,
          "overlap" : 0.05,
      }).connect(delay);

  player.volume.value = -2; // Higher volume optimized for mobile.
      // GUI //
  Interface.Button({
          text :"play" ,
          activeText :"stop" ,
          parent : sliders,
          type : "toggle",
          start : function(){
              player.start();
          },
          end : function(){
              player.stop();
          }
      });

  Interface.Slider({
          param : "playbackRate",
          name : "Speed",
          parent : sliders,
          tone : player,
          min : 0.2,
          max : 4,
           drag: function (value) {
             output.value = value;
             output.style.top = value + 'px';
           },
      });
  Interface.Slider({
          param : "detune",
          name : "detune",
          parent : sliders,
          tone : player,
          min : -1200,
          max : 1200,
      });
  Interface.Slider({
          param : "grainSize",
          name : "grainSize",
          parent : sliders,
          tone : player,
          min : 0.01,
          max : 0.2,
      });
  Interface.Slider({
          param : "overlap",
          name : "overlap",
          parent : sliders,
          tone : player,
          min : 0,
          max : 0.2,
      });
}
