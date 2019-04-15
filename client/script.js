console.log("hello world!");

let planeCount = 0;
let planeDepth = -20;

let token = null;
let starterTrack = {
	id: "3skn2lauGk7Dx6bVIt5DVj",
	name: "Starlight",
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

let WIDTH, HEIGHT;


// TODO: implement this!
let searchAroundCurrentTrack = false;			// adjust search criteria around this track			

let playedTracks = [];

let currentTrack = starterTrack;				// TODO: should be null

var allTracks = [];								// all the tracks we've gotten from Spotify so far
let trackCurrentlyMousedOver = null;


let mapLoop = null;					// variable to contain canvas loop

let lastMouseX = 0;					// last know mouse coordinates
let lastMouseY = 0;

let mousePressed = false;

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




	document.querySelectorAll(".play-in-app").forEach(function(button){
		button.addEventListener("click", (el) => {
			let uri = el.target.dataset.uri;

			playInApp(uri);

		});
	});


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

	currentTrack = track;

	let url = "/get-recs"


	// TODO: implement reading from sliders, enable searchAroundCurrentTrack

	if(searchAroundCurrentTrack && track.analysis){
		document.getElementById("energy").value = track.analysis.energy; 
		document.getElementById("valence").value = track.analysis.valence; 
		document.getElementById("danceability").value = track.analysis.danceability; 
		document.getElementById("tempo").value = track.analysis.tempo; 	
	}



/*	let data = {
		seedTrack: track.id,
		energy: Number(document.getElementById("energy").value),
		valence: Number(document.getElementById("valence").value),
		danceability: Number(document.getElementById("danceability").value),
		tempo: Number(document.getElementById("tempo").value)
	}*/

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
					if(object.type == "Mesh" && object.geometry.type == "SphereGeometry" && object.data.id == track.id){
						currentTrack = object;
						playedTracks.push(currentTrack);
						updatePlayingTrackInfo(object);
					}
				});
	    	}

	    	// only add tracks if they're not in our db yet.
	    	data.tracks.forEach((track) => {
	    		if(!recordedIds.includes(track.id)){
	    			allTracks.push(track);
	    			addStar(track);
	    		} else {
	    			console.log(`Looks like ${track.name} is already in the system`);
	    		}
	    	});



	    	planeCount++;

	    	// TODO: enable printout of JSON response, displaying track cards
	    	//document.getElementById("response").innerText = JSON.stringify(JSON.parse(res.data), false, 2);
	    	// displayRecommendations();

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
	let previousLine = scene.children.forEach((child) => {
		if(child.type == "Line"){
			scene.remove(child);
		}
	});
}


function playClosestTrack(thisTrack){

	let currentMinDistance = Infinity;
	let closestTrack = null;

	let playedTrackIds = playedTracks.map((track) => {	
		return track.data.id;
	});

	console.log(playedTrackIds);

	// cycle through the children, but only the stars
	scene.children.forEach((object) => {

		if(object.type == "Mesh" && object.geometry.type == "SphereGeometry"){

			let distance = getDistanceIn3d(object.position.x, object.position.y, object.position.z,  thisTrack.position.x, thisTrack.position.y, thisTrack.position.z);

			if(object.data.id != thisTrack.data.id && distance < currentMinDistance && !playedTrackIds.includes(object.data.id)){
				currentMinDistance = distance;
				closestTrack = object; 
			}
		}

	})

	
	if(closestTrack != null){
		console.log("found closest track: ", closestTrack.data.name);

		playedTracks.push(closestTrack);			// add to played tracks

		currentTrack = closestTrack;
		playedTracks.push(closestTrack);

		playInApp(closestTrack.data.uri);
		drawPlayedTrackPath();
		updatePlayingTrackInfo(currentTrack);
		
	} else {
		console.log("couldn't find a close track!");
		getNewRecommendations(thisTrack.data);

		setTimeout(function(){
			playClosestTrack(thisTrack.data);
		}, 2000)
	}

}

function updatePlayingTrackInfo(track){

	// center on current track 
	//camera.position.set(track.position.x, track.position.y,  camera.position.z);

	document.getElementById("album-photo").innerHTML = `<img src="${track.data.album.images[2].url}" />`;
	document.getElementById("playing-name").innerHTML = `${track.data.name}`;
	document.getElementById("playing-album").innerHTML = `${track.data.album.name} (${track.data.album.release_date})`;
	document.getElementById("playing-artist").innerHTML = `${track.data.artists[0].name}`;


	// change colors
	scene.children.forEach((child) => {

		if(child.type == "Mesh" && child.geometry.type == "SphereGeometry"){

			if(track.data.id == child.data.id){
				console.log(child.material.color);
				child.material.color.set(0xfca420);
				console.log(child.material.color);
			} else {
				child.material.color.set(0x5aaff1);
			}
		}

	});



}


document.getElementById("play-next-track").addEventListener("click", function(){
	playClosestTrack(currentTrack);

});

document.getElementById("get-recommendations-for-current-track").addEventListener("click", function(){
	getNewRecommendations(currentTrack)
});

document.getElementById("search-songs").addEventListener("click", function(){
	searchSongs(document.getElementById("song").value)
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

WIDTH = mapWrapper.offsetWidth;
HEIGHT = mapWrapper.offsetHeight;

renderer.setSize(WIDTH, HEIGHT);

mapWrapper.appendChild(renderer.domElement);

let scene = new THREE.Scene;


// field-of-view (how much we can see around), aspect (screen ratio), near, and far -
// the closest & furthest things the camera can see 
camera = new THREE.PerspectiveCamera( 45, WIDTH / HEIGHT, 0.1, 5000);

let canvas = document.querySelector("canvas");
//let controls = new THREE.OrbitControls( camera, canvas );

camera.position.set(500, 540, 280);
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
	var intersects = raycaster.intersectObjects( scene.children );

//	console.log(intersects.length);

	if(intersects.length == 1){

		if(intersects[0].object.geometry && intersects[0].object.geometry.type == "SphereGeometry"){
			let thisStar = intersects[0].object;
			thisStar.material.color.set(0xff0000);
			document.body.style.cursor = "pointer";
			document.getElementById("hover-track-name").innerHTML = `${thisStar.data.artists[0].name}: ${thisStar.data.name}`;
		}


		// this is a veeeery ugly way of checking if we're already displaying this card
		if(trackCurrentlyMousedOver !== null){
			document.getElementById("current-track").innerHTML = getTrackCard(trackCurrentlyMousedOver);
			
			if(trackCurrentlyMousedOver.preview_url == null){
				let divs = document.querySelectorAll(".one-track");
				divs[0].classList += " no-preview";
			} else {
				let previewDivs = document.querySelectorAll(".track-preview");
				previewDivs[0].innerHTML += `<a href = "${trackCurrentlyMousedOver.preview_url}" target="_blank">Preview</a>`;

			}

			
		}

	} else {
		trackCurrentlyMousedOver = null
		document.body.style.cursor = "default";
		document.getElementById("hover-track-name").innerHTML = "-";
		// unselect all
		scene.children.forEach((object) => {
			if(typeof(object.geometry) != "undefined" && object.geometry.type == "SphereGeometry"){
				object.material.color.set(0x5aaff1);
			}
		})

	}

	displayCameraPosition();

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
 


render();
addCameraControls();


function addStar(track){

	let thisXposition = WIDTH * track.analysis.valence; //*4;
	let thisYposition = HEIGHT * track.analysis.energy; //*4;

	let starMaterial = new THREE.MeshLambertMaterial({ color: 0x5aaff1 });

	let star = new THREE.Mesh(starGeometry, starMaterial);
	star.position.set(thisXposition, thisYposition, planeCount * planeDepth);		// negative so it's away from us

	star.data = track;			// storing track data in the star 

	scene.add(star);
	//camera.lookAt(star.position);
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
	var intersects = raycaster.intersectObjects( scene.children );


	if(intersects.length == 1){

		if(typeof(intersects[0].object.geometry) != "undefined" && intersects[0].object.geometry.type == "SphereGeometry"){
			let thisStar = intersects[0].object.data;

			//getNewRecommendations(thisStar);

			playedTracks.push(intersects[0].object);

			currentTrack = intersects[0].object;

			console.log("the new currentTrack is");
			console.log(currentTrack);


			//console.log(thisStar);
			playInApp(thisStar.uri);
			updatePlayingTrackInfo(intersects[0].object);
			drawPlayedTrackPath();

		}

	
	}

}

function onResize(){

	mapWrapper = document.getElementById("map-wrapper");

	WIDTH = mapWrapper.offsetWidth;
	HEIGHT = mapWrapper.offsetHeight;

	renderer.setSize(WIDTH, HEIGHT);

	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();

}


document.querySelector("canvas").addEventListener( 'mousemove', onMouseMove, false );
document.querySelector("canvas").addEventListener( 'click', onClick, false );
window.addEventListener( 'resize', onResize, false );


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


function playInApp(uri){

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
