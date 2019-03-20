/*
let canvas = document.getElementById("song-map");
let ctx = canvas.getContext('2d');

let WIDTH = canvas.width;
let HEIGHT = canvas.height;

let mapLoop = null;

function loop(){

	if(mapLoop != null){
		clearInterval(mapLoop);
	}

	mapLoop = setInterval(drawMap, 50);

}



function drawMap(){

	drawStar(currentTrack, "orange");


	allTracks.forEach((track) => {
		drawStar(track, "blue");
	});

}

function drawStar(track, color){
	let thisXposition = WIDTH * track.analysis.valence;
	let thisYposition = HEIGHT * track.analysis.energy;

	circle(thisXposition, thisYposition, 3, color, false)
}










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
        if(player.powerUps.hyperspeed.active){
            ctx.strokeStyle = "#F9B600";
        } else {
            ctx.strokeStyle = "#0197FF";
        }
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
}*/