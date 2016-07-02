// set variables for environment
var express = require('express');
var app = express();
//use default express session store
var session = require('express-session');
app.use(session({ secret: 'keyboard cat' , cookie: { maxAge: 60000 }}));

//use cookie parser to get request cookies value
var cookieParser = require('cookie-parser');
app.use(cookieParser());

var path = require('path');
//generate a random unique string
var rs = require('random-strings');
var http = require('http');
var querystring = require('querystring');
//parse post parameters
var bodyParser = require("body-parser");
//get the request ip address
var requestIp = require('request-ip');

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// views as directory for all template files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // use either jade or ejs       
// instruct express to server up static assets
app.use(express.static('public'));
// Set server port
app.listen(3000);
console.log('server is running');

// set routes
app.use('/oauth/login', function(req, response) {
    
    var consumer_info="", consumer_token="";
    
    var postData = querystring.stringify({
      'key' : 'adfsa','secret':'fsdfs','callback_url':'/oauth/callback'
    });
    
    var options = {
        hostname: '',
        port: 4000,
        path: '/oauth/authorize',
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
        }
    };

    var req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);        
        //console.log(res.headers["set-cookie"]);
        
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
            consumer_info += chunk;
        });
        res.on('end', () => {
            //parse the consumer
            if(res.statusCode == 200){
                console.log("received consumer info:  "+consumer_info);
                consumer_token = JSON.parse(consumer_info).consumer_token;
                console.log('No more data in response.');
                //get the response set-cookie value and set to the new request
                //response["set-cookie"] = res.headers["set-cookie"];
                response.redirect(301, 'http://localhost:4000/oauth/login?consumer_token='+consumer_token);
            }
        })
    });
    
    req.on('error', (e) => {
      console.log(`problem with request: ${e.message}`);
    });

    // write data to request body
    req.write(postData);
    req.end();
});

app.use('/oauth/callback', function(req, res) {
    
    if (req.method == 'POST'){
        console.log(req.body);
        var locals = { resource_token: req.body.resource_token };
        
        res.render('index',locals);
    }
    
    if (req.method == 'GET'){
        console.log(req.query);
        var locals = { resource_token: req.query.resource_token };
        
        res.render('index',locals);
    }
    
});

app.use('/oauth/resource', function(req, response) {
    
    if (req.method == 'POST'){
        console.log(req.body);
        var locals = { resource_token: req.body.resource_token };
        
        res.render('index',locals);
    }
    
    if (req.method == 'GET'){
        console.log(req.query);
        var resource_token = req.query.resource_token;
        var resource_approval = '';
        
        var postData = querystring.stringify({'resource_token' : resource_token });
    
        var options = {
            hostname: '',
            port: 5000,
            path: '/oauth/resource',
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
            }
        };

        var req = http.request(options, (res) => {
            console.log(`STATUS: ${res.statusCode}`);        
            //console.log(res.headers["set-cookie"]);

            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`);
                resource_approval += chunk;
            });
            res.on('end', () => {
                //parse the consumer
                if(res.statusCode == 200){
                    //consumer_token = JSON.parse(resource_approval).consumer_token;
                    // 数据以json形式返回
                    console.log(JSON.parse(resource_approval).resource_url);
                    var locals = { resource_url : JSON.parse(resource_approval).resource_url };
                    response.render('resource',locals);
                }
            })
        });

        req.on('error', (e) => {
          console.log(`problem with request: ${e.message}`);
        });

        // write data to request body
        req.write(postData);
        req.end();
        
    }
    
});