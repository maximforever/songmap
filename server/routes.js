let express = require('express');
let request = require('request');
let router = express.Router();


const bodyParser = require('body-parser');              // parse request body

require('dotenv').config()                              // access .env file


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

    console.log("Got a post to test!");

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

                console.log("access token:");
                console.log(body.access_token)

                res.send({
                    message:"yo, dis yo server. we cool."
                })
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