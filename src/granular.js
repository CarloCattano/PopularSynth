import Tone from 'tone'
window.Tone = Tone

import amb1Url from '../public/audio/amb1.mp3'

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

  Interface.Loader();
  Interface.Slider({
      parent : $("#FXsliders"),
      tone: filter1,
      param: "frequency",
      axis: "x",
      initial: 10,
      min: 60,
      max: 20000,
      exp: 5,
      drag: function (value) {
           lfo2range();
      },
  });
  Interface.Slider({
      name : delay,
      parent : $("#FXsliders"),
      tone: delay,
      param: "feedback",
      axis: "x",
      initial: 0,
      min: 0,
      max: 0.97,
  });
  Interface.Button({
      parent : $("#FXsliders"),
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
       parent : $("#FXsliders"),
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
      parent : $("#FXsliders"),
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
  debugger
  player.volume.value = -18;
      // GUI //
  Interface.Loader();
  Interface.Button({
          text :"play" ,
          activeText :"stop" ,
          parent : $("#Sliders"),
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
          parent : $("#Sliders"),
          tone : player,
          min : 0.2,
          max : 4,
           drag: function (value) {
              outputUpdate(value);
           },
      });
  Interface.Slider({
          param : "detune",
          name : "detune",
          parent : $("#Sliders"),
          tone : player,
          min : -1200,
          max : 1200,
      });
  Interface.Slider({
          param : "grainSize",
          name : "grainSize",
          parent : $("#Sliders"),
          tone : player,
          min : 0.01,
          max : 0.2,
      });
  Interface.Slider({
          param : "overlap",
          name : "overlap",
          parent : $("#Sliders"),
          tone : player,
          min : 0,
          max : 0.2,
      });

  function outputUpdate(value) {
  var output = document.querySelector("#volume");
  output.value = value;
  output.style.top = value + 'px';
  }
}
