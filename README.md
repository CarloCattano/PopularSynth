# PopularSynth - A synth for the people

Multi user Web synthesis experience.

Each group of users gets a different role assigned with different Timber and characteristics.

Uses Tone.js, an incredible library that if you dont know and you are into Web Audio, you will LOVE https://tonejs.github.io/

From a terminal with npm & node.js 9.+:

1. Change the lines of the code where the IP must be setted to the server IP (looking for a dinamic solution for this)
2. `$ npm install socket.io http express --save`
3. `$ node server.js` 
4. From a web browser on the same network, access the server IP from the url bar. Example: 192.168.0.6
