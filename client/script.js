console.log("hello world!");

let planeCount = 0;
let planeDepth = -20;

let token = null;
let starterTrack = {
	id: "3skn2lauGk7Dx6bVIt5DVj",
	name: "Starlight",
	uri: "spotify:track:3skn2lauGk7Dx6bVIt5DVj",
	analysis: {
	  "danceability": 0.55,
	  "energy": 0.874,
	  "key": 4,
	  "loudness": -4.046,
	  "mode": 1,
	  "speechiness": 0.0321,
	  "acousticness": 0.000436,
	  "instrumentalness": 0.0000102,
	  "liveness": 0.206,
	  "valence": 0.318,
	  "tempo": 121.61,
	  "type": "audio_features",
	  "id": "3skn2lauGk7Dx6bVIt5DVj",
	  "uri": "spotify:track:3skn2lauGk7Dx6bVIt5DVj",
	  "track_href": "https://api.spotify.com/v1/tracks/3skn2lauGk7Dx6bVIt5DVj",
	  "analysis_url": "https://api.spotify.com/v1/audio-analysis/3skn2lauGk7Dx6bVIt5DVj",
	  "duration_ms": 240213,
	  "time_signature": 4
	},
	"album": {
		"name": "Black Holes And Revelations",
		"release_date": "2006-06-19",
		"images": [
		    {
		      "height": 640,
		      "url": "https://i.scdn.co/image/9e5288926fadb82f873ccf2b45300c3a6f65fa14",
		      "width": 640
		    },
		    {
		      "height": 300,
		      "url": "https://i.scdn.co/image/f1cad0d6974d6236abd07a59106e8450d85cae24",
		      "width": 300
		    },
		    {
		      "height": 64,
		      "url": "https://i.scdn.co/image/81a3f82578dc938c53efdcb405f6a3d3ebbf009f",
		      "width": 64
		    }
		]  
	},
    "artists": [
    {
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/12Chz98pHFMPJEknJQMWvI"
      },
      "href": "https://api.spotify.com/v1/artists/12Chz98pHFMPJEknJQMWvI",
      "id": "12Chz98pHFMPJEknJQMWvI",
      "name": "Muse",
      "type": "artist",
      "uri": "spotify:artist:12Chz98pHFMPJEknJQMWvI"
    }
  ],
}


let axisSelection = {
	x: "valence",
	y: "energy"
}



let WIDTH, HEIGHT;


// TODO: implement this!
let searchAroundCurrentTrack = false;			// adjust search criteria around this track			

let playedTracks = [];

let currentTrack = starterTrack;				// TODO: should be null
let currentlyPlayingTrack = null;


let allTracks = [];								// all the tracks we've gotten from Spotify so far
let trackCurrentlyMousedOver = null;


let mapLoop = null;					// variable to contain canvas loop

let lastMouseX = 0;					// last know mouse coordinates
let lastMouseY = 0;

let mousePressed = false;

let exploreWithManualControl = false;
let exploreAroundSong = false;
let songToExploreAround = null;



/* functions */



let attachClickListeners = () => {

	document.querySelectorAll(".get-more").forEach(function(el){
		el.addEventListener("click", (el) => {

			//e.stopPropagation() ??
			

			let currentTrack = {
				id: el.target.id,
				name: el.target.dataset.name
			}

			getNewRecommendations(currentTrack);
		});
	})

}


let crunchStats = (data) => {

	let danceability = valence = energy = tempo = 0;

	data.forEach((track) => {

		danceability += track.analysis.danceability;
		tempo += track.analysis.tempo;
		energy += track.analysis.energy;
		valence += track.analysis.valence;
	});

	console.log(`V: ${valence/data.length} D: ${danceability/data.length} E: ${energy/data.length} T: ${tempo/data.length}`);
}




let displayRecommendations = () => {

	console.log("starting!");
	crunchStats(allTracks);

	//document.getElementById("stuff").innerHTML = "";

	document.getElementById("all-tracks").innerHTML = (
		`
		<h2>Recommendations for ${currentTrack.name}</h2>
		<h4>Total: ${allTracks.length}</h4>
		<div id="recommendations"></div>
		`
	)


	let last20tracks = allTracks.slice((allTracks.length - 20), allTracks.length);	

	last20tracks.forEach((track) => {

		document.getElementById("recommendations").innerHTML += getTrackCard(track);

		if(track.preview_url == null){
			let divs = document.querySelectorAll(".one-track");
			divs[divs.length-1].classList += " no-preview";
		} else {
			let previewDivs = document.querySelectorAll(".track-preview");
			previewDivs[previewDivs.length-1].innerHTML += `<a href = "${track.preview_url}" target="_blank">Preview</a>`;

		}
	})


	calculateGenres();

	attachClickListeners();
}

function getTrackCard(track){
	return `<div class = "one-track">
    			<div class="track-main-info">
    				<img src="${track.album.images[2].url}" />
    				<div class="track-text-info">
    					<p class="track-header" >${track.name} by <strong>${track.artists[0].name}</strong></p>  
    					<p>${track.album.name} (${track.album.release_date})</p>    	
    				</div>		
				</div>
				<div class = "track-preview">
					<a href = "${track.external_urls.spotify}" target="_blank">Open in Spotify</a>
					<button class="play-in-app" data-uri="${track.uri}">Play in Spotify</button>
				</div>
				<div class = "genres">${track.genres}</div>
				<div class = "track-stats">
					<p>SPCH ${track.analysis.speechiness}</p>
					<p>ACOUST ${track.analysis.acousticness}</p>
					<p>INST ${track.analysis.instrumentalness}</p>
					<p>LIVE ${track.analysis.liveness}</p>
					<p>VAL ${track.analysis.valence}</p>
					<p>TMP ${track.analysis.tempo}</p>
					<p>ENG ${track.analysis.energy}</p>
				</div>
				<button class="get-more" id="${track.id.trim()}" data-name="${track.name}"> MOAR LIKE DIS</button>
    		</div>`
}

function getNewRecommendations(track){

	let start = Date.now();

	console.log(track);

	// play if nothing is playing
	if(currentlyPlayingTrack === null){
		setNewTrackParameters(track);
		playInApp(track.uri)
		currentlyPlayingTrack = track;
	}

	let url = "/get-recs"

	if(track.data){
		track = track.data;
	}

	let data = {
		seedTrack: track.id,
		energy: track.analysis.energy,
		valence: track.analysis.valence,
		danceability: track.analysis.danceability,
		tempo: track.analysis.tempo
	}

	if(exploreAroundSong){
		data = {
			seedTrack: songToExploreAround.id,
			min_energy: (track.analysis.energy  - 0.2),
			min_valence: (track.analysis.valence - 0.2),
			min_danceability: (track.analysis.danceability - 0.2),
			max_energy: (track.analysis.energy + 0.2),
			max_valence: (track.analysis.valence  + 0.2),
			max_danceability: (track.analysis.danceability + 0.2),
			tempo: track.analysis.tempo
		}
	}

	if(exploreWithManualControl){
		data = {
			seedTrack: track.id,
			energy: Number(document.getElementById("energy").value),
			valence: Number(document.getElementById("valence").value),
			danceability: Number(document.getElementById("danceability").value),
			tempo: Number(document.getElementById("tempo").value)
		}
	}

	console.log(data);


	fetch(url, {
		method: "POST",
		body: JSON.stringify(data),
		headers:{
		    'Content-Type': 'application/json'			// this is important! express won't read our data as json without it
		 }
	})
	  	.then(function(response) {
	    	return response.json();			// parses response to JSON
	  	})
	  	.then(function(res) {

	  		let end = Date.now();
	  		let time = end - start;
	  		console.log(`got a response in ${time}ms`);
	  		let data = JSON.parse(res.data);
	    	token = res.token;
	    	

	    	// TODO: Write this 
	    	//updateSearchValues(track);


	    	let recordedIds = allTracks.map((track) => {
	    		return track.id;
	    	});

	    	// add current track - the initial, seed track
	    	if(!recordedIds.includes(track.id)){
	    		allTracks.push(track);
	    		addStar(track);

	    		// update playing track card
	    		scene.children.forEach((object) => {
					if(object.star && object.data.id == track.id){
						currentlyPlayingTrack = currentTrack = object;
						playedTracks.push(currentTrack);
					}
				});

				displayUpdatedSliderValues();
	    	}

	    	// only add tracks if they're not in our db yet.
	    	data.tracks.forEach((track) => {
	    		if(!recordedIds.includes(track.id)){
	    			allTracks.push(track);
	    			addStar(track);
	    		} else {
	    			//console.log(`Looks like ${track.name} is already in the system`);
	    		}
	    	});

	    	planeCount++;

	  });
}


let searchSongs = (term) => {

	term = term.trim().replace(new RegExp(/\s+/, "g"), "%20");
	let url = `https://api.spotify.com/v1/search/?q=${term}`;

	console.log(url);


	fetch(url, {
		headers: {
            'Authorization': `Bearer ${token}`
        },
        json: true,
		method: "GET"
	})
	  .then(function(response) {
	    return response.json();
	  })
	  .then(function(myJson) {
	    	console.log(myJson);
	    	
	  });
} 



function calculateGenres(){


	let genreMap = {};


	allTracks.forEach((track) => {

		track.genres.forEach((genre) => {

			if(typeof(genreMap[genre]) == "undefined"){
				genreMap[genre] = 0;
			}

			genreMap[genre] = genreMap[genre] + 1;
		})

	})


	console.log(genreMap);

}

function drawPlayedTrackPath(){

	if(playedTracks.length > 1){

		removePastPlayedTrackPath();

		

		//let material = new THREE.LineBasicMaterial( { color: 0x404c5e } );

		let lineMaterial = new THREE.LineDashedMaterial( {
			color: 0x404c5e,
			linewidth: 5,
			scale: 1,
			dashSize: 0.1,
			gapSize: 0.1,
		} );



		let pathGeometry = new THREE.Geometry();
		let playedPathLine = new THREE.Line(pathGeometry, lineMaterial );

		console.log(playedTracks);

		playedTracks.forEach((track) => {
			pathGeometry.vertices.push(new THREE.Vector3( track.position.x, track.position.y, track.position.z) );
		});

		scene.add(playedPathLine);
	}

}

function removePastPlayedTrackPath(){
	let previousLine = scene.children.forEach((object) => {
		if(object.type == "Line"){
			scene.remove(object);
		}
	});
}


function playClosestTrack(thisTrack){



	console.log(thisTrack);


	if(scene.children.length < 4){
		console.log("nothing to play!");
		return;
	}

	let currentMinDistance = Infinity;
	let closestTrack = null;

	let playedTrackIds = playedTracks.map((track) => {	
		return track.data.id;
	});

	if(playedTracks.length == allTracks.length){
		console.log("nothing left to play");
	} else {
		// cycle through the children, but only the stars
		scene.children.forEach((object) => {
			if(object.star){

				let distance = getDistanceIn3d(object.position.x, object.position.y, object.position.z,  thisTrack.position.x, thisTrack.position.y, thisTrack.position.z);

				if(object.data.id != thisTrack.data.id && distance < currentMinDistance && !playedTrackIds.includes(object.data.id)){
					currentMinDistance = distance;
					closestTrack = object; 
				} 
			}
		})

	}

	if(closestTrack != null){
		console.log("found closest track: ", closestTrack.data.name);

		playedTracks.push(closestTrack);			// add to played tracks

		setNewTrackParameters(closestTrack.data);


		
		playInApp(closestTrack.data.uri);
		currentlyPlayingTrack = currentTrack = closestTrack;
		playedTracks.push(closestTrack);


		closestTrack.actions.currentlyPlaying = true;

		
		drawPlayedTrackPath();
		
	} else {
		console.log("couldn't find a close track!");
		getNewRecommendations(thisTrack.data);

		setTimeout(function(){
			playClosestTrack(thisTrack);
		}, 2000)
	}

}


document.getElementById("play-next-track").addEventListener("click", function(){
	playClosestTrack(currentTrack);

});

document.getElementById("get-recommendations-for-current-track").addEventListener("click", function(){
	getNewRecommendations(currentTrack)
});


function getDistanceIn2d(x1, y1, x2, y2){
	return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))
}

function getDistanceIn3d(x1, y1, z1, x2, y2, z2){
	return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2) + Math.pow((z2 - z1), 2));

}


/* ======================================================== */

/* three.js stuff */


let camera;


let raycaster = new THREE.Raycaster();				// thing that lets us select stuff in 3d space

let mouse = new THREE.Vector2(), INTERSECTED;

let renderer = new THREE.WebGLRenderer({
	//alpha: true, // remove canvas' bg color
	antialias: true
});

let mapWrapper = document.getElementById("map-wrapper");

WIDTH = window.innerWidth;
HEIGHT = window.innerHeight;

renderer.setSize(WIDTH, HEIGHT);

mapWrapper.appendChild(renderer.domElement);

let scene = new THREE.Scene;


// field-of-view (how much we can see around), aspect (screen ratio), near, and far -
// the closest & furthest things the camera can see 
camera = new THREE.PerspectiveCamera( 45, WIDTH / HEIGHT, 0.1, 5000);

let canvas = document.querySelector("canvas");
//let controls = new THREE.OrbitControls( camera, canvas );

camera.position.set(480, 640, 260);
// controls.update();					// must be called after any manual changes to the camera's transform


//skybox 

let skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
let skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.FrontSide });
let skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
 
scene.add(skybox);

let topLight = new THREE.PointLight(0xffffff);
//let bottomLight = new THREE.PointLight(0xffffff);
topLight.position.set(500, 500, 500);
//bottomLight.position.set(0, 0, 0);
 
scene.add(topLight);
//scene.add(bottomLight);

let starGeometry = new THREE.SphereGeometry(1, 32, 32 );

function render() {


	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	let intersects = raycaster.intersectObjects( scene.children );

//	console.log(intersects.length);


	scene.children.forEach((object) => {
		
		if(object.star){

			if(object.actions.hover){
				object.material.color.set(0xff0000);
			} else if(object.actions.currentlyPlaying){
				object.material.color.set(0xf77700);
			} else if(object.actions.previouslyPlayed){
				object.material.color.set(0x94ff7a);
			} else {
				object.material.color.set(0x1e9dff);
			}

		}

	});



	if(intersects.length == 1 && intersects[0].object.star){
			
			let thisStar = intersects[0].object;
			thisStar.actions.hover = true;
			document.body.style.cursor = "pointer";
			displayTrack(thisStar.data);

	} else {
		trackCurrentlyMousedOver = null
		document.body.style.cursor = "default";


		let trackToDisplay = typeof(currentTrack.data) != "undefined" ? currentTrack.data : currentTrack;
		
		if(document.getElementById("playing-name").innerText != trackToDisplay.name){
			displayTrack(trackToDisplay);
		}
		
		
		// unselect all
		scene.children.forEach((object) => {
			if(object.star){
				object.actions.hover = false;
			}
		})

	}

	displayCameraPosition();

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function displayTrack(track){
	document.getElementById("playing-album-photo").innerHTML = `<img src="${track.album.images[2].url}" />`;
	document.getElementById("playing-name").innerHTML = `${track.name}`;
	document.getElementById("playing-album").innerHTML = `${track.album.name}`;
	document.getElementById("playing-artist").innerHTML = `${track.artists[0].name}`;
}
 


render();
addCameraControls();


function addStar(track){

	let thisXposition = WIDTH * track.analysis[axisSelection.x]; //*4;
	let thisYposition = HEIGHT * track.analysis[axisSelection.y]; //*4;

	let starMaterial = new THREE.MeshLambertMaterial({ color: 0x5aaff1 });

	let star = new THREE.Mesh(starGeometry, starMaterial);
	star.position.set(thisXposition, thisYposition, planeCount * planeDepth);		// negative so it's away from us

	star.data = track;			// storing track data in the star 

	star.star = true;			// how we know this is a star

	star.actions = {
		currentlyPlaying: false,
		hover: false
	}


	scene.add(star);
	//camera.lookAt(star.position);
}

function updateStarPositions(){

	scene.children.forEach((object) => {
		if(object.star){
			let thisStar = object;
			thisStar.position.x = WIDTH * thisStar.data.analysis[axisSelection.x];
			thisStar.position.y = WIDTH * thisStar.data.analysis[axisSelection.y];
		}
	});

}

function displayCameraPosition(){
	document.getElementById("camera-x").innerText = Math.floor(camera.position.x * 10)/10;
	document.getElementById("camera-y").innerText = Math.floor(camera.position.y * 10)/10;
	document.getElementById("camera-z").innerText = Math.floor(camera.position.z * 10)/10;

	//90 * Math.PI / 180
	document.getElementById("camera-angle-x").innerText = Math.floor(camera.rotation.x * 10)/10;
	document.getElementById("camera-angle-y").innerText = Math.floor(camera.rotation.y * 10)/10;
	document.getElementById("camera-angle-z").innerText = Math.floor(camera.rotation.z * 10)/10;

}

function displayMousePosition(x, y){
	document.getElementById("mouse-x").innerText = x;
	document.getElementById("mouse-y").innerText = y;
}


function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	let canvas = document.querySelector("canvas");

	mouse.x = ( event.offsetX / WIDTH ) * 2 - 1;
	mouse.y = - ( event.offsetY / HEIGHT ) * 2 + 1;

	mouse.x = Math.floor(mouse.x * 100)/100
	mouse.y = Math.floor(mouse.y * 100)/100

	displayMousePosition(mouse.x, mouse.y)

}

function onClick( event ){

	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	let intersects = raycaster.intersectObjects( scene.children );


	if(intersects.length == 1){

		if(intersects[0].object.star){

			intersects[0].object.actions.currentlyPlaying = true;
			let thisStar = intersects[0].object.data;

			//getNewRecommendations(thisStar);

			playedTracks.push(intersects[0].object);

			setNewTrackParameters(thisStar);
			playInApp(thisStar.uri);
			currentlyPlayingTrack = currentTrack = intersects[0].object;

			console.log("the new currentTrack is");
			console.log(currentTrack);

			
			drawPlayedTrackPath();

		}

	
	}

}

function onResize(){

	mapWrapper = document.getElementById("map-wrapper");

	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;

	renderer.setSize(WIDTH, HEIGHT);

	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();

}

function toggleExploreControls(){

	let panelIsDisplayed = document.getElementById("explore-controls").style.display;
	document.getElementById("explore-controls").style.display = (panelIsDisplayed == "flex") ? "none" : "flex";
	exploreAroundSong = false;
}

function toggleInstructions() {
	let panelIsDisplayed = document.getElementById("instructions").style.display;
	document.getElementById("instructions").style.display = (panelIsDisplayed == "flex") ? "none" : "flex";
}

function toggleExploringAroundSong() {
 
	exploreAroundSong = document.getElementById("like-this-song").checked;
	document.getElementById("manual-control").checked = false;
	exploreWithManualControl = false;

	if(exploreAroundSong){
		let track = typeof(currentTrack.data) != "undefined" ? currentTrack.data : currentTrack;

		document.getElementById("energy-value").innerText = Math.floor(track.analysis.energy * 100) / 100; 
		document.getElementById("valence-value").innerText = Math.floor(track.analysis.valence * 100) / 100; 
		document.getElementById("danceability-value").innerText = Math.floor(track.analysis.danceability * 100) / 100; 
		document.getElementById("tempo-value").innerText = Math.floor(track.analysis.tempo * 10) / 10; 

		songToExploreAround = track;	
	} else {
		songToExploreAround = null;
	}

}

function toggleExploringWithManualControl() {

	exploreWithManualControl = document.getElementById("manual-control").checked;
	document.getElementById("like-this-song").checked = false;
	exploreAroundSong = false;

}

function updateAxes(){
	axisSelection.x = document.getElementById("x-axis-selector").value;
	axisSelection.y = document.getElementById("y-axis-selector").value;

	updateStarPositions();

	removePastPlayedTrackPath();
	drawPlayedTrackPath();

}



document.querySelector("canvas").addEventListener( 'mousemove', onMouseMove, false );
document.querySelector("canvas").addEventListener( 'click', onClick, false );
document.getElementById("toggle-explore-controls").addEventListener( 'click', toggleExploreControls, false );
document.getElementById("controls-close").addEventListener( 'click', toggleExploreControls, false );
document.getElementById("toggle-instructions").addEventListener( 'click', toggleInstructions, false );
document.getElementById("instructions-close").addEventListener( 'click', toggleInstructions, false );
document.getElementById("like-this-song").addEventListener( 'click', toggleExploringAroundSong, false );
document.getElementById("manual-control").addEventListener( 'click', toggleExploringWithManualControl, false );

document.getElementById("x-axis-selector").addEventListener('change', updateAxes, false);
document.getElementById("y-axis-selector").addEventListener('change', updateAxes, false);

window.addEventListener( 'resize', onResize, false );

document.querySelectorAll(".slider").forEach((slider) => {
	slider.addEventListener( 'click', () => {
		
		exploreWithManualControl = true;
		exploreAroundSong = false;
		document.getElementById("like-this-song").checked = false;
		document.getElementById("manual-control").checked = true;

		displayUpdatedSliderValues();
	});
});


function updateLightPosition(){
	topLight.position.set(camera.position.x, camera.position.y, camera.position.z);
}



function addCameraControls(){

	document.addEventListener("mousedown", () => {
		mousePressed = true;
	})

	document.addEventListener("mouseup", () => {
		mousePressed = false;
	})




	document.addEventListener("keydown",(e) => {

		updateLightPosition();

		if(e.which == 65){
			camera.position.x -= 10;
			displayCameraPosition();
		}

		if(e.which == 87){
			camera.position.y += 10;
			displayCameraPosition();
		}


		if(e.which == 68){
			camera.position.x += 10;
			displayCameraPosition();
		}

		if(e.which == 83){
			camera.position.y -= 10;
			displayCameraPosition();
		}



		if(e.which == 38){
			e.preventDefault();
			camera.position.z -= 10;
			displayCameraPosition();
		}


		if(e.which == 40){
			e.preventDefault();
			camera.position.z += 10;
			displayCameraPosition();
		}


		// rotate  



		if(e.which == 76){
			camera.rotation.y -= (5 * Math.PI / 180);
			displayCameraPosition();
		}


		if(e.which == 74){
			camera.rotation.y += (5 * Math.PI / 180);
			displayCameraPosition();
		}


		if(e.which == 73){
			camera.rotation.x += (5 * Math.PI / 180);
			displayCameraPosition();
		}


		if(e.which == 75){
			camera.rotation.x -= (5 * Math.PI / 180);
			displayCameraPosition();
		}




	});


}

function markCurrentTrackAsPlayed(){

	scene.children.forEach((object) => {

		if(object.star && object.data.id == currentTrack.data.id){
			object.actions.currentlyPlaying = false;
			object.actions.previouslyPlayed = true;
		}

	});
}

function setNewTrackParameters(track){

	if(!exploreAroundSong && !exploreWithManualControl){
		document.getElementById("energy").value = track.analysis.energy; 
		document.getElementById("valence").value = track.analysis.valence; 
		document.getElementById("danceability").value = track.analysis.danceability; 
		document.getElementById("tempo").value = track.analysis.tempo; 

		document.getElementById("energy-value").innerText = Math.floor(track.analysis.energy * 100) / 100; 
		document.getElementById("valence-value").innerText = Math.floor(track.analysis.valence * 100) / 100; 
		document.getElementById("danceability-value").innerText = Math.floor(track.analysis.danceability * 100) / 100; 
		document.getElementById("tempo-value").innerText = Math.floor(track.analysis.tempo * 10) / 10; 
	}
}

function displayUpdatedSliderValues(){
	document.getElementById("energy-value").innerText = Math.floor(document.getElementById("energy").value * 10) / 10; ; 
	document.getElementById("valence-value").innerText = Math.floor(document.getElementById("valence").value * 10) / 10; ; 
	document.getElementById("danceability-value").innerText = Math.floor(document.getElementById("danceability").value * 10) / 10; ; 
	document.getElementById("tempo-value").innerText = document.getElementById("tempo").value; 
}


function playInApp(uri){

	markCurrentTrackAsPlayed();

	let data = {
		uri: uri
	};

	let url = `/play-in-app`;

	fetch(url, {
        json: true,
		method: "POST",
		body: JSON.stringify(data),
		headers:{
		    'Content-Type': 'application/json'			// this is important! express won't read our data as json without it
		}
	})
	  .then(function(response) {
	    return response.json();
	  })
	  .then(function(myJson) {
	    
	    	if(myJson.error){
	    		console.log("ERROR");
	    		console.log(myJson.error.message);
	    	} else {
	    		console.log(myJson);
	    	}	
	  });

}
