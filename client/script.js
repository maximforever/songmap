console.log("hello world!");

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
	}
}

let searchAroundCurrentTrack = true;			// adjust search criteria around this track			

let playedTracks = [];

let currentTrack = {							
	id: null, 
	name: null
}

var allTracks = [];								// all the tracks we've gotten from Spotify so far
let trackCurrentlyMousedOver = null;


let mapLoop = null;					// variable to contain canvas loop

let lastMouseX = 0;					// last know mouse coordinates
let lastMouseY = 0;

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

	if(searchAroundCurrentTrack && track.analysis){
		document.getElementById("energy").value = track.analysis.energy; 
		document.getElementById("valence").value = track.analysis.valence; 
		document.getElementById("danceability").value = track.analysis.danceability; 
		document.getElementById("tempo").value = track.analysis.tempo; 	
	}



	let data = {
		seedTrack: track.id,
		energy: Number(document.getElementById("energy").value),
		valence: Number(document.getElementById("valence").value),
		danceability: Number(document.getElementById("danceability").value),
		tempo: Number(document.getElementById("tempo").value)
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

	    	// only add tracks if they're not in our db yet.
	    	data.tracks.forEach((track) => {
	    		if(!recordedIds.includes(track.id)){
	    			allTracks.push(track);
	    			addStar(track);
	    		} else {
	    			console.log(`Looks like ${track.name} is already in the system`);
	    		}
	    	})


	    	document.getElementById("response").innerText = JSON.stringify(JSON.parse(res.data), false, 2);
	    	
	    	displayRecommendations();
	    	//loop();					// this is the bit that draws things!
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

	console.log(thisTrack);

	// cycle through the children, but only the stars
	scene.children.forEach((object) => {

		if(object.type == "Mesh" && object.geometry.type == "SphereGeometry"){

			let distance = getDistanceIn3d(object.position.x, object.position.y, object.position.z,  thisTrack.position.x, thisTrack.position.y, thisTrack.position.z);
			console.log(distance, object.data.name);

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
		
	} else {
		console.log("couldn't find a close track!");
		getNewRecommendations(thisTrack.data);

		setTimeout(function(){
			playClosestTrack(thisTrack);
		}, 2000)
	}

}




document.getElementById("get-recs").addEventListener("click", function(){
	getNewRecommendations(starterTrack)
});

document.getElementById("play-next-track").addEventListener("click", function(){
	playClosestTrack(currentTrack);

});

document.getElementById("more-like-this").addEventListener("click", function(){
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

var mouse = new THREE.Vector2(), INTERSECTED;


const WIDTH = 600;
const HEIGHT = 600;

let renderer = new THREE.WebGLRenderer({
	//alpha: true, // remove canvas' bg color
	antialias: true
});

renderer.setSize(WIDTH, HEIGHT);

document.getElementById("map-wrapper").appendChild(renderer.domElement);

let scene = new THREE.Scene;


// field-of-view (how much we can see around), aspect (screen ratio), near, and far -
// the closest & furthest things the camera can see 
camera = new THREE.PerspectiveCamera( 45, WIDTH / HEIGHT, 0.1, 5000);

//camera.position.set(430, 1020, 800);
camera.position.set(200, 500, 250);


//skybox 

let skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
let skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.FrontSide });
let skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
 
scene.add(skybox);

let pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(0, 0, 1000);
 
scene.add(pointLight);

let starGeometry = new THREE.SphereGeometry(1, 32, 32 );

function render() {


	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( scene.children );


	if(intersects.length == 1){

		console.log(intersects[0].object);


		if(intersects[0].object.geometry && intersects[0].object.geometry.type == "SphereGeometry"){
			let thisStar = intersects[0].object;
			thisStar.material.color.set(0xff0000);
			document.body.style.cursor = "pointer";
			document.getElementById("hover-track-name").innerHTML = thisStar.data.name;
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



	


	// render scene

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
	star.position.set(thisXposition, thisYposition, 0);

	star.data = track;			// storing track data in the star 

	scene.add(star);
	//camera.lookAt(star.position);
}

function displayCameraPosition(){
	document.getElementById("camera-x").innerText = camera.position.x;
	document.getElementById("camera-y").innerText = camera.position.y;
	document.getElementById("camera-z").innerText = camera.position.z;

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

			drawPlayedTrackPath();

			currentTrack = intersects[0].object;

			console.log("the new currentTrack is");
			console.log(currentTrack);

			//console.log(thisStar);
			playInApp(thisStar.uri);
			console.log(`${thisStar.name} - ${thisStar.artists[0].name}`);
		}

	
	}

}


document.querySelector("canvas").addEventListener( 'mousemove', onMouseMove, false );
document.querySelector("canvas").addEventListener( 'click', onClick, false );





function addCameraControls(){
	document.addEventListener("keydown",(e) => {


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
			camera.rotation.z -= (5 * Math.PI / 180);
			displayCameraPosition();
		}


		if(e.which == 74){
			camera.rotation.z += (5 * Math.PI / 180);
			displayCameraPosition();
		}


		if(e.which == 73){
			camera.rotation.y -= (5 * Math.PI / 180);
			displayCameraPosition();
		}


		if(e.which == 75){
			camera.rotation.y += (5 * Math.PI / 180);
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
