//the player
		var player = new Tone.GrainPlayer({
			"url" : "./audio/amb1.[mp3|ogg]",
			"loop" : true,
			"grainSize" : 0.1,
			"overlap" : 0.05,
		}).connect(delay);
		// GUI //
Interface.Loader();
	Interface.Button({
			text : "Start",
			activeText : "Stop",
			parent : $("#Sliders"),
			type : "toggle",
			start : function(){
				StartAudioContext(Tone.context);
				player.start();
			},
			end : function(){
				player.stop();
			}
		});
	Interface.Slider({
			param : "playbackRate",
			name : "playbackRate",
			parent : $("#Sliders"),
			tone : player,
			min : 0.5,
			max : 2,
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