#!/usr/bin/env node

var express = require('express')
    , app = express()
    , stylus = require('stylus')
    , nib = require('nib')
    , http = require('http')
    , server = http.createServer(app)
    , io = require('socket.io').listen(server);

server.listen(3000);

// Jade
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Stylus
function compile(str, path) {
    return stylus(str)
            .set('filename', path)
            .use(nib());
}

app.use(stylus.middleware(
    { src: __dirname + '/public' , compile: compile}
));

// Static files
app.use(express.static(__dirname + '/public'));

// Route / as index
app.get('/', function (req, res) {
    res.render('index', {pageTitle: 'ClipJS - Home'});
});

// Display response
app.use(express.logger('dev'))

var allClients = 0;  
var clientId = 1;  

io.sockets.on('connection', function (client) { 
    var my_timer; 
    var my_client = { 
        "id": clientId, 
        "obj": client 
    };  
    
    clientId += 1;  
    allClients += 1;  
    
    my_timer = setInterval(function () { 
        my_client.obj.send(JSON.stringify({ 
            "timestamp": (new Date()).getTime(), 
            "clients": allClients 
        })); 
    }, 1000); 
    
    client.on('message', function(data) { 
        my_client.obj.broadcast.send(JSON.stringify({ 
            message: data
        })); 
        console.log(data); 
    }); 
    
    client.on('disconnect', function() { 
        clearTimeout(my_timer); 
        allClients -= 1;  
        console.log('disconnect'); 
    }); 
});
