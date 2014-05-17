var express = require('express');
var bodyParser     = require('body-parser');
//var http = require("http");
var request = require('request');
var app = express();

/* APP CONFIGURATION */

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

/*ROUTES*/

app.get('/', function(req, res) {
    res.render('index');
    //req.io.broadcast('newList', {'list': currentBikesList});
});

/* APP FUNCTIONS */
//call of the json area bay bikes
var currentBikesList="";
var newBikesList;
var lastUpdatedTime="";
var refresh = false;

function getBikes(){
        //refresh = false;
        request('http://bayareabikeshare.com/stations/json/', function (error, response, body) {
          if (!error && response.statusCode == 200) {
                newBikesList = JSON.parse(body);
            //console.log("List loaded from http://bayareabikeshare.com/stations/json/");
            if(lastUpdatedTime!=newBikesList.executionTime){
                currentBikesList = newBikesList;
                lastUpdatedTime = newBikesList.executionTime;
                //console.log(currentBikesList);
                io.sockets.emit('newList', {'list': currentBikesList});
                console.log("-->The list has changed ! "+lastUpdatedTime+" "+refresh);
            }
            else{
                refresh=false;
                //console.log("No need to update the list hasn't changed");
            }
          }
          else {
                if(error){
                        refresh=false;
                        console.log("Something went wrong while loading new datas");
                }
          }
        });
}



setInterval(function(){
        //console.log("refresh");
        getBikes();
}, 5000);

/*START SERVER*/

var server = app.listen(3000, function() {
    console.log('Listening on port 3000');
});

// use socket.io
var io = require('socket.io').listen(server);

// define interactions with client
io.sockets.on('connection', function(socket){
    console.log("new client");
    //send current data to client
    socket.emit('newList', {'list': currentBikesList});

});
