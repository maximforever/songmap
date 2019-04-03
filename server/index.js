const fs = require("fs");                               // access file system  - I DON'T THINK I NEED THIS
const path = require("path");                           // access paths - I DON'T THINK I NEED THIS
const express = require("express");                     // express
const bodyParser = require('body-parser');              // parse request body
const cors = require('cors');							// enable CORS

const app = express();
const routes = require('./routes');                     // routes file

require('dotenv').config()

app.set("views", path.join(__dirname, "../client/views"));      // tells us where our views are
console.log(`Running in *${process.env.NODE_ENV}* environment`);

app.set("view engine", "ejs");                                  // tells us what view engine to use
app.use(express.static('client'));                              // sets the correct directory for static files we're going to serve 
app.use(cors())

app.use(bodyParser.json());                                     // display body as JSON
app.use(express.urlencoded({ extended: true }));                // parses incoming requests with urlencoded payloads
app.use(routes);                                                // move my routes into a separate file

app.listen(process.env.PORT);
app.set("port", process.env.PORT || 3000)                       // we're gonna start a server on whatever the environment port is or on 3000







