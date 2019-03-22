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
		el.addEventListener("click", (e) => {

			//e.stopPropagation() ??
			

			let currentTrack = {
				id: e.target.id,
				name: e.target.dataset.name
			}

			getNewRecommendations(currentTrack);
		});
	})

	console.log("done!");

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

let getNewRecommendations = (track) => {

	let start = Date.now();

	console.log(track);

	currentTrack = track;
	playedTracks.push(track);
	drawPath();
	

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
	    		} else {
	    			console.log(`Looks like ${track.name} is already in the system`);
	    		}
	    	})


	    	document.getElementById("response").innerText = JSON.stringify(JSON.parse(res.data), false, 2);
	    	
	    	displayRecommendations();
	    	loop();
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

document.getElementById("get-recs").addEventListener("click", function(){
	getNewRecommendations(starterTrack)
});

document.getElementById("next").addEventListener("click", function(){
	getClosestTrack(currentTrack)
});

document.getElementById("more-like-this").addEventListener("click", function(){
	getNewRecommendations(currentTrack)
});

document.getElementById("search-songs").addEventListener("click", function(){
	searchSongs(document.getElementById("song").value)
});

/* ======================================================== */

/* canvas stuff */

var canvas = document.getElementById("song-map");
var ctx = canvas.getContext('2d');

var WIDTH = canvas.width;
var HEIGHT = canvas.height;

canvas.addEventListener("mousemove", function(e){
	onMouseMove(e.offsetX, e.offsetY);
});

canvas.addEventListener("click", function(e){
	if(trackCurrentlyMousedOver != null){
		getNewRecommendations(trackCurrentlyMousedOver);
	}
});


function onMouseMove(x,y){
	lastMouseX = x;
	lastMouseY = y;
}


function checkMouseHover(){


	trackCurrentlyMousedOver = null;
	let x = lastMouseX;
	let y = lastMouseY;

	if(!allTracks.length){
		return;
	}

	allTracks.forEach((track) => {

		let trackX = Number(WIDTH * track.analysis.valence);
		let trackY = Number(HEIGHT * track.analysis.energy);

		let distance = getDistance(trackX, trackY, x, y);


		if(distance < 10){
			trackCurrentlyMousedOver = track; 
		}

	})

	// this is a veeeery ugly way of checking if we're already displaying this card
	if(trackCurrentlyMousedOver != null){
		highlightTrack(trackCurrentlyMousedOver);
		document.getElementById("current-track").innerHTML = getTrackCard(trackCurrentlyMousedOver);
		
		if(trackCurrentlyMousedOver.preview_url == null){
			let divs = document.querySelectorAll(".one-track");
			divs[0].classList += " no-preview";
		} else {
			let previewDivs = document.querySelectorAll(".track-preview");
			previewDivs[0].innerHTML += `<a href = "${trackCurrentlyMousedOver.preview_url}" target="_blank">Preview</a>`;

		}

		document.body.style.cursor = "pointer";
	} else {
		document.body.style.cursor = "default";
	}
}


function highlightTrack(track){

	let trackX = Number(WIDTH * track.analysis.valence);
	let trackY = Number(HEIGHT * track.analysis.energy);

	ctx.strokeStyle = "white";
	ctx.lineWidth = 2;

	ctx.beginPath();
	ctx.arc(trackX, trackY, 5, 0, 2 * Math.PI);
	ctx.stroke();

}

function loop(){

	clearInterval(mapLoop);

	mapLoop = setInterval(drawMap, 50);

}



function drawMap(){

	clear();
	drawBackground();
	drawPath();

	allTracks.forEach((track) => {
		drawStar(track);
	});

	checkMouseHover();

}

function drawStar(track){

	let color = (track.id == currentTrack.id) ? "orange" : "#5aaff1";

	let thisXposition = WIDTH * track.analysis.valence;
	let thisYposition = HEIGHT * track.analysis.energy;

	circle(thisXposition, thisYposition, 2, color, false)
}

function drawBackground(){
	rect(0 ,0, WIDTH, HEIGHT, "#010115");             // draw background
}


function drawPath(){


	if(playedTracks.length > 1){

		ctx.beginPath(); 
		ctx.lineWidth = 1;
		ctx.strokeStyle = "rgba(155, 155, 155, 0.5)";

		ctx.moveTo(WIDTH * playedTracks[0].analysis.valence, HEIGHT * playedTracks[0].analysis.energy);
		

		playedTracks.forEach((track) => {
			ctx.lineTo(WIDTH * track.analysis.valence, HEIGHT * track.analysis.energy);
		});


		

		ctx.stroke();
	}
}

function getClosestTrack(thisTrack){

	var minDistance = Infinity;
	var closestTrack = null;

	let playedTrackIds = playedTracks.map((track) => {
		return track.id;
	});


	allTracks.forEach((track) => {

		let trackX = Number(WIDTH * track.analysis.valence);
		let trackY = Number(HEIGHT * track.analysis.energy);


		let currentTrackX = Number(WIDTH * thisTrack.analysis.valence);
		let currentTrackY = Number(HEIGHT * thisTrack.analysis.energy);

		let distance = getDistance(trackX, trackY, currentTrackX, currentTrackY);

		if(track.id != thisTrack.id && distance < minDistance && !playedTrackIds.includes(track.id)){
			minDistance = distance;
			closestTrack = track; 
		}

	})

	
	if(closestTrack != null){
		console.log("found", closestTrack);

		playedTracks.push(closestTrack);			// add to played tracks
		currentTrack = closestTrack;				// play track
		
	} else {
		console.log("couldn't find a close track!");
		getNewRecommendations(currentTrack);

		setTimeout(function(){
			getClosestTrack(currentTrack);
		}, 1000)
	}



	

	//TODO: actually play the frakkin' track

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







/* ======================================================== */

// LIBRARY CODE

function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);                 // creates a rectangle the size of the entire canvas that clears the area
}

function circle(x,y,r, color, stroke) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, false);               // start at 0, end at Math.PI*2
    ctx.closePath();
    ctx.fillStyle = color;

    if(stroke){
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
    }

    ctx.fill();
}

function rect(x,y,w,h, color) {
    ctx.beginPath();
    ctx.rect(x,y,w,h);
    ctx.closePath();

    ctx.strokeStyle = "black";
    ctx.fillStyle = color;
    ctx.stroke();
    ctx.fill();
}

function text(text, x, y, size, color, centerAlign){
    ctx.font =  size + "px Rajdhani";
    ctx.fillStyle = color;

    if(centerAlign){
        ctx.textAlign = "center";
    } else {
        ctx.textAlign = "left";
    }

    ctx.fillText(text, x, y);
}

function line(x1, y1, x2, y2){
    ctx.beginPath();
    ctx.strokeStyle = "rgba(250,250,250, 0.4)";
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}


function getDistance(x1, y1, x2, y2){
	return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))
}





// // D3 stuff

// var canvas = document.getElementById("song-map"),
//     context = canvas.getContext("2d"),
//     width = canvas.width,
//     height = canvas.height;

// var d3Canvas = d3.select("canvas");
// d3Canvas.on('mousemove', handleMove);

// var simulation = d3.forceSimulation()
//     .force("link", d3.forceLink().id(function(d) { return d.id; }))
//     .force("charge", d3.forceManyBody())
//     .force("center", d3.forceCenter(width / 2, height / 2));


// function drawMap(){

// 	console.log("drawing");

// 	console.log(allTracks.length);

// 	var jsonData = {tracks: allTracks}
// 	console.log(jsonData["tracks"]);


// 	simulation
// 		.nodes(jsonData.tracks)
// 		.on("tick", ticked);


// /*	simulation.force("link")
// 		.links(jsonData.tracks);*/

// 	function ticked() {
// 	    context.clearRect(0, 0, width, height);
// 	    context.save();
// 	    /*context.translate(width / 2, height / 2 + 40);*/

// 	    context.beginPath();
// 	    //jsonData.tracks.forEach(drawLink);
// 	    context.strokeStyle = "#aaa";
// 	    context.stroke();
// 	    context.font = "12px Arial";

// 	    context.beginPath();
// 	    jsonData.tracks.forEach(drawNode);
// 	    context.fill();
// 	    context.strokeStyle = "#fff";
// 	    context.stroke();

// 	    context.restore();
// 	}

// 	function drawLink(d) {
// 		context.moveTo(d.source.x, d.source.y);
// 		context.lineTo(d.target.x, d.target.y);
// 	}

// 	function drawNode(d) {

// 		/*context.fillStyle = "white";
		
// 		context.fillText(d.name, d.x, d.y - 10);*/
// 		context.fillStyle = "black";

// 		context.moveTo(d.x + 3, d.y);
// 		context.arc(d.x, d.y, 5, 0, 2 * Math.PI);

// 	}


// }


// function handleMove() {
// 	var point = d3.mouse(this);
// 	var node;
// 	var minDistance = Infinity;

// 	allTracks.forEach(function(d) {

// 		var dx = d.x - point[0];
// 		var dy = d.y - point[1];

// 		var distance = Math.sqrt((dx * dx) + (dy * dy));

// 		if (distance < minDistance && distance < 20) {
// 			// drawCircles(d);
// 			minDistance = distance;
// 			node = d;
// 		}
// 	});

// 	if(typeof(node) == "undefined"){
// 		return
// 	}

// 	document.getElementById("song-info").innerHTML = (
// 		`<p>${node.name}</p>`
// 	)
// }




