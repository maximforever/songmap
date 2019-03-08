console.log("hello world!");


document.getElementById("auth").addEventListener("click", () => {
	console.log("I can't believe you've done this");



	let url = "/test"
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
	  });
})