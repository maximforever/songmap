var express = require('express');
var router = express.Router();

const bodyParser = require('body-parser');              // parse request body

require('dotenv').config()                              // access .env file


/* MIDDLEWARE */

/* log incoming request*/
router.use(function(req, res, next){                                            // logs request URL
    var timeNow = new Date();
    console.log(`==> ${req.method.toUpperCase()} ${req.url} on ${timeNow}`);
    next();
});

/* ROUTES */

router.get("/", function(req, res){

    res.render("index", {session: req.session});
    
});

/* 404 */

router.use(function(req, res) {
    console.log("404 PAGE DOES NOT EXIST");
    res.status(404);
    res.redirect("/");
});
    


module.exports = router;