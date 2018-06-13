import Tone from 'tone'

import A1 from './1.mp3'
import B1 from './2.mp3'
import C2 from './3.mp3'
import D2 from './4.mp3'
import E2 from './5.mp3'
import F2 from './6.mp3'
import G2 from './7.mp3'
import A2 from './8.mp3'

export default () => {
  var cutoffPos = 500;
  //// AUDIO MASTER
  var reverb = new Tone.JCReverb(0.5).toMaster();
  var delay = new Tone.FeedbackDelay(0.48, 0).connect(reverb);
  var dist = new Tone.Distortion(0.2).connect(delay);
  var filter1 = new Tone.Filter(20000, "lowpass", -24).connect(dist);
  //// FX PARAMS
  filter1.Q.value = 0.4;
  filter1.gain.value = 0.35;
  filter1.frequency.value = cutoffPos;
  reverb.wet.value = 0.7;
  Tone.context.latencyHint = "interactive";  // "balanced" "playback" "interactive"

  //the player
  var Sampler = new Tone.Sampler({
    A1, B1, C2, D2, E2, F2, G2, A2}, {
    'release' : 1
  }).connect(filter1);

  Sampler.volume.value = -20;

  // GUI //

  $('#Title').text('48h sound')
  $('#Explanation').text('Sampler')

  const sliders = document.createElement("div")
  const sliders2 = document.createElement("div")
  $('#Content').append(sliders)
  $('#Content').append(sliders2)

  Interface.Button({
          text : "Start",
          activeText : "",
          parent : sliders,
          type : "moment",
          start : function(){
              Sampler.triggerAttack("A1");
          },
          end : function(){
               Sampler.triggerRelease("A1");
          }
      });
  Interface.Button({
          text : "Start",
          activeText : "Stop",
          parent : sliders,
          type : "moment",
          start : function(){
              Sampler.triggerAttack("B1");
          },
          end : function(){
               Sampler.triggerRelease("B1");
          }
      });
  Interface.Button({
          text : "Start",
          activeText : "Stop",
          parent : sliders,
          type : "moment",
          start : function(){
              Sampler.triggerAttackRelease("C2",0.25);
          },
      });
  Interface.Button({
          text : "Start",
          activeText : "Stop",
          parent : sliders,
          type : "moment",
          start : function(){
              Sampler.triggerAttackRelease("D2",0.25);
          },
      });
  /////SLIDERS 2
  Interface.Button({
          text : "Start",
          activeText : "Stop",
          parent : sliders2,
          type : "moment",
          start : function(){
              Sampler.triggerAttackRelease("E2",0.25);
          },
      });
  Interface.Button({
          text : "Start",
          activeText : "Stop",
          parent : sliders2,
          type : "moment",
          start : function(){
              Sampler.triggerAttackRelease("F2",0.25);
          },
      });
  Interface.Button({
          text : "Start",
          activeText : "Stop",
          parent : sliders2,
          type : "moment",
          start : function(){
              Sampler.triggerAttackRelease("G2",0.25);
          },
      });
  Interface.Button({
          text : "Start",
          activeText : "Stop",
          parent : sliders2,
          type : "moment",
          start : function(){
              Sampler.triggerAttackRelease("A2",0.25);
          },
      });
  Interface.Slider({
          param : "frequency",
          name : "Filter",
          parent : sliders,
          tone : filter1,
          value : cutoffPos,
          min : 120,
          max : 20000,
          exp : 4.4,
      });
  Interface.Slider({
          param : "feedback",
          name : "feedback",
          parent : sliders,
          tone : delay,
          value : 0,
          min : 0,
          max : 0.98  ,
      });
  Interface.Slider({
          name : "delayTime",
          parent : sliders,
          value : 0,
          min : 0.01,
          max : 1.0,
          drag: function (value) {
          delay.delayTime.rampTo(value, 0.8);
      },
  });
}
