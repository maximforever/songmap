console.log("hello world!");

let token = null;
let starterTrack = {
	id: "3skn2lauGk7Dx6bVIt5DVj",
	name: "Starlight"
}


let currentTrack = {
	id: null, 
	name: null
}

let allTracks = [];


let attachClickListeners = () => {

	document.querySelectorAll(".get-more").forEach(function(el){
		el.addEventListener("click", (e) => {

			//e.stopPropagation() ??

			console.log(e.target.dataset);
			currentTrack = {
				id: e.target.id, 
				name: e.target.dataset.name
			}

			getNewRecommendations(currentTrack);
		});
	})

}


let crunchStats = (data) => {

	let danceability = valence = energy = tempo = 0;

	data.tracks.forEach((track) => {

		danceability += track.analysis.danceability;
		tempo += track.analysis.tempo;
		energy += track.analysis.energy;
		valence += track.analysis.valence;
	});

	console.log(`Valence: ${valence/data.tracks.length}`);
	console.log(`Danceability: ${danceability/data.tracks.length}`);
	console.log(`Energy: ${energy/data.tracks.length}`);
	console.log(`Tempo: ${tempo/data.tracks.length}`);
}




let displayRecommendations = (data) => {

	crunchStats(data);

	document.getElementById("stuff").innerHTML = "";

	console.log(currentTrack);

	document.getElementById("stuff").innerHTML += (
		`
		<h2>Recommendations for ${currentTrack.name}</h2>
		<div id="recommendations"></div>
		`
	)




	for(key in data.tracks){
		let track = data.tracks[key];

		document.getElementById("recommendations").innerHTML += (
    		`<div class = "one-track">
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
				<div class = "track-stats">
					<p>SPCH ${track.analysis.speechiness}</p>
					<p>ACOUST ${track.analysis.acousticness}</p>
					<p>INST ${track.analysis.instrumentalness}</p>
					<p>LIVE ${track.analysis.liveness}</p>
					<p>VAL ${track.analysis.valence}</p>
					<p>TMP ${track.analysis.tempo}</p>
				</div>
				<button class="get-more" id="${track.id.trim()}" data-name="${track.name}"> MOAR LIKE DIS</button>
    		</div>`
		)	    		

		if(track.preview_url == null){
			let divs = document.querySelectorAll(".one-track");
			divs[divs.length-1].classList += " no-preview";
		} else {
			let previewDivs = document.querySelectorAll(".track-preview");
			previewDivs[previewDivs.length-1].innerHTML += `<a href = "${track.preview_url}" target="_blank">Preview</a>`;

		}
	}

	attachClickListeners();
}

let getNewRecommendations = (track) => {

	console.log(track.id);

	currentTrack = {
		id: track.id,
		name: track.name
	};

	let url = "/get-recs"

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

	  		let data = JSON.parse(res.data);
	    	token = res.token;
	    	allTracks = allTracks.concat(data.tracks);
	    	console.log(`Tracks in dataset: ${allTracks.length}`);

	    	document.getElementById("response").innerText = JSON.stringify(JSON.parse(res.data), false, 2);
	    	
	    	displayRecommendations(data);

	  });
}

document.getElementById("get-token").addEventListener("click", () => {
	console.log("I can't believe you've done this");



	let url = "/get-token"
	let myData = JSON.stringify({
		name: "max"
	});


	fetch(url, {
		method: "POST",
		body: myData,
	})
	  .then(function(response) {
	    return response.json();
	  })
	  .then(function(myJson) {
	    	console.log(myJson);

	    	token = myJson.token;
	    	
	  });
})

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

document.getElementById("search-songs").addEventListener("click", function(){
	searchSongs(document.getElementById("song").value)
});







