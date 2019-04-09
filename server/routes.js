let express = require('express');
let request = require('request');
let router = express.Router();
const bodyParser = require('body-parser');                          // parse request body
const querystring = require('querystring');



require('dotenv').config()                                          // access .env file
router.use(bodyParser.json());                                     // display body as JSON



// TODO: REMOVE THIS!!! STORE THIS DATA IN A COOKIE
let ACCESS_TOKEN = null;


/* MIDDLEWARE */

/* log incoming request*/
router.use(function(req, res, next){                                            // logs request URL
    let timeNow = new Date();
    console.log(`==> ${req.method.toUpperCase()} ${req.url} on ${timeNow}`);
    next();
});

/* ROUTES */

router.get("/", (req, res) =>{

    if(ACCESS_TOKEN === null){
        res.redirect("/login");
    } else {
        res.render("index", {session: req.session});
    }

    
    
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

/* Client Credentials Flow */


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
                        if(err || analysisResponse.statusCode != 200){
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


router.get('/login', function(req, res) {

  let state = randomString(16);
  let scope = 'user-modify-playback-state playlist-read-private user-read-private';

  // your application requests authorization
  // var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope: scope,
      redirect_uri: process.env.REDIRECT_URI,
      state: state
    }));
});


router.post("/play-in-app", function(req, res){

    console.log(req.body);

    //res.send({status: "success!"});


    if(ACCESS_TOKEN != null){

        let playUrl = 'https://api.spotify.com/v1/me/player/play'

        let data = {
            uris: [req.body.uri.toString()]
        }

        console.log(data);

        request.put({
            url: playUrl,
            headers: {
                'Authorization': "Bearer " + ACCESS_TOKEN
            },
            body: data,
            json: true
        },

        function(err, playResponse, playBody){

            //console.log(playResponse);

            console.log(playResponse.statusCode);

            // sends a 204 if OK - no content; nothing for the client to do
            if(err || playResponse.statusCode != 204){
                console.log("ERROR!");
                console.log(playResponse.body.error);
                res.send({error: playResponse.body.error})
            } else {

                console.log("IT WORKED!");
                res.send({status: "oh wow it worked"})
            }
        });
    } else {
        res.send({status: "access token issue"})
    }

});


/* Authorization Code Flow */

router.get('/spotify-login-redirect', function(req, res){

    let code = req.query.code || null;
    let state = req.query.state || null;


    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: process.env.REDIRECT_URI,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + new Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET).toString('base64')
        },
        json: true
    };


    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        let access_token = body.access_token;
        let refresh_token = body.refresh_token;

        let options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        ACCESS_TOKEN = access_token;

        res.redirect("/#authorized");
/*
        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));

        */
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });


    //console.log("got a ping to redirect uri");
    //res.redirect("/")
});



// OTHER

function randomString(length) {
  let text = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += chars[Math.floor(Math.random() * chars.length)];
  }

  return text;
};




/* 404 */

router.use(function(req, res) {
    console.log("404 PAGE DOES NOT EXIST");
    res.status(404);
    res.redirect("/");
});
    


module.exports = router;