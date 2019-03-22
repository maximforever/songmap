let express = require('express');
let request = require('request');
let router = express.Router();
const bodyParser = require('body-parser');                          // parse request body

require('dotenv').config()                                          // access .env file
router.use(bodyParser.json());                                     // display body as JSON



/* MIDDLEWARE */

/* log incoming request*/
router.use(function(req, res, next){                                            // logs request URL
    let timeNow = new Date();
    console.log(`==> ${req.method.toUpperCase()} ${req.url} on ${timeNow}`);
    next();
});

/* ROUTES */

router.get("/", (req, res) =>{
    res.render("index", {session: req.session});
    
});

router.post("/test", (req, res) => {


    let data = JSON.stringify({
        
    });

    let requestUrl = "https://accounts.spotify.com/api/token";

    var auth = "Basic " + new Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET).toString('base64');

    request.post({
        uri: requestUrl,
        headers: {
            'Authorization': auth
        },
        form: {
            grant_type: "client_credentials"
        },
        json: true
    },
    function(err, spotifyResponse, body){

        if(err){
            console.log("ERROR!");
            console.log(err);
        } else {

            res.send({
                message: "Got the access token!",
                token: body.access_token 
            })
        }
    })
})


router.post("/get-recs", (req, res) => {


    console.log(req.body);

    let data = JSON.stringify({
        // some data?
    });

    let requestUrl = "https://accounts.spotify.com/api/token";

    var authWithAPICredentials = "Basic " + new Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET).toString('base64');



    request.post({
        uri: requestUrl,
        headers: {
            'Authorization': authWithAPICredentials
        },
        form: {
            grant_type: "client_credentials"
        },
        json: true
    },
    function(err, spotifyResponse, body){

        if(err){
            console.log("ERROR!");
            console.log(err);
        } else {

            let token = body.access_token;
            console.log("GOT A TOKEN!", token);

        /* --------------------   GET RECOMMENDATIONS  --------------------*/
        /* -------------------- move into own function --------------------*/

            let baseUrl = "https://api.spotify.com/v1/recommendations";

            let limit="20"
            let seed_tracks=req.body.seedTrack;
            let danceability=req.body.danceability;
            let valence=req.body.valence;
            let energy=req.body.energy;
            let tempo=req.body.tempo;


            // we have to specify the market, or we don't get a preview
            let completeUrl = `
                ${baseUrl}?limit=${limit}&seed_tracks=${seed_tracks}&market=US&target_danceability=${danceability}&target_valence=${valence}&target_energy=${energy}&target_tempo=${tempo}`;
            console.log(completeUrl);
            
            let authWithToken = "Bearer " + token;

            console.log(authWithToken);

            request.get({
                url: completeUrl,
                headers: {
                    'Authorization': authWithToken
                },
                json: true
            },
            function(err, spotifyResponse, trackBody){
                if(err || spotifyResponse.statusCode != 200){
                    console.log("ERROR!");
                    console.log(err);
                } else {

                    /* --------------------   GET TRACK ANALYSIS  --------------------*/

                    let songIds = [];
                    let artistIds = [];

                    /*let ids = trackBody.tracks.map((song) => {
                        return song.id;
                    });*/

                    trackBody.tracks.forEach((song) => {
                        songIds.push(song.id);

                        if(!artistIds.includes(song.artists[0].id)){
                            artistIds.push(song.artists[0].id);
                        }
                    });

                    console.log("got the ids!");
                    console.log(songIds);
                    
                    /* move into own function */

                    let analysisUrl = "https://api.spotify.com/v1/audio-features/?ids=";

                    for(let i = 0; i < songIds.length; i++){
                        analysisUrl += (songIds[i] + ",")
                    }

                    //console.log(analysisUrl);

                    request.get({
                        url: analysisUrl,
                        headers: {
                            'Authorization': authWithToken
                        },
                        json: true
                    },
                    function(err, analysisResponse, analysisBody){
                        if(err || spotifyResponse.statusCode != 200){
                            console.log("ERROR!");
                            console.log(err);
                        } else {

                            //console.log(analysisBody);

                            let genreUrl = "https://api.spotify.com/v1/artists?ids=";

                            for(let i = 0; i < artistIds.length; i++){
                                genreUrl += (artistIds[i])

                                if (i < artistIds.length - 1){
                                    genreUrl += ","
                                }
                            }

                            console.log(genreUrl);

                            request.get({
                                url: genreUrl,
                                headers: {
                                    'Authorization': authWithToken
                                },
                                json: true
                            },
                            function(err, analysisResponse, artistInfoBody){
                                if(err || spotifyResponse.statusCode != 200){
                                    console.log("ERROR!");
                                    console.log(err);
                                } else {
                                    
                                    // match songs to their analyses and genres
                                    

                                    //console.log(artistInfoBody);

                                    for(let i = 0; i < trackBody.tracks.length; i++){

                                        let thisTrack = trackBody.tracks[i];

                                        thisTrack.analysis = analysisBody.audio_features.find((analysis) => {
                                            return analysis.id == thisTrack.id;
                                        }) 

                                        thisTrack.genres = artistInfoBody.artists.find((artist) => {
                                            return artist.id == thisTrack.artists[0].id
                                        }).genres;          // this is hacky, but find returns the whole element - can't just return artist.genres

                                    }


                                    res.send({
                                        token: token,
                                        message: "Got the stuff!",
                                        data: JSON.stringify(trackBody)
                                    })
                                }
                            })
                        }
                    })







                    /* -------------------- */


                }


            })

        /* -------------------- */

        }
    })


})



/* 404 */

router.use(function(req, res) {
    console.log("404 PAGE DOES NOT EXIST");
    res.status(404);
    res.redirect("/");
});
    


module.exports = router;