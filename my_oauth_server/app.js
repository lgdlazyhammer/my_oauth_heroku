require('./initdb.js').initdb();
// set variables for environment
var express = require('express');
var app = express();
//use default express session store
var session = require('express-session');

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
app.listen(4000);
console.log('server is running');

var sessionService = require('./session_service');
var OAuthSession = require('./session_property');

// set routes
app.use('/oauth/login', function(req, res) {
    
    /*var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;
    
     console.log(ip);*/
    var sess;
    
    sessionService.getOAuthSession(req.query.consumer_token,function(data){
        
        console.log("data from the session **************************");
        console.log(data);
        sess = JSON.parse(data[0].session);
        
        var locals = { session_id : req.query.consumer_token };
        
        if(data != null && data != undefined){
            res.render('login',locals);
        }else{
            res.send(403, "unauthorized");
        }
    });

});

// set routes
app.use('/oauth/authorize', function(req, res) {
   
    //generate a consumer token
    var session_id = rs.alphaLower(30);
    
    if (req.method == 'POST'){
        
        var key = req.body.key;
        var secret = req.body.secret;
        var callback_url = req.body.callback_url;
        
        //check the consumer
        var consumerExist = true;
        if(consumerExist){
            var clientIp = requestIp.getClientIp(req);
            console.log("client ip:  "+clientIp);
            //sess.callback_url = clientIp+callback_url;
            //sess.consumer_token = token;
            var oauthSessionInfo = JSON.stringify({ consumer: key ,callback_url:clientIp+callback_url });
            var expiresDate = Math.floor(Date.now() / 1000);
            console.log(oauthSessionInfo +"********"+expiresDate+"***date tostring****"+Date.now().toString());
            var oauthSession = new OAuthSession(session_id,oauthSessionInfo,expiresDate);
            
            sessionService.save(oauthSession,function(result){
					console.log("result " +  result);
                    // 数据以json形式返回
                    var temp = { consumer_token: session_id };
                    console.log("send response:  "+JSON.stringify(temp));
                    res.status(200).send(JSON.stringify(temp));
            });
        }else{
            res.status(403).send("unauthorized");
        }
        
    }
    
    if (req.method == 'GET'){
        console.log(req.query);
        
        var key = req.query.key;
        var secret = req.query.secret;
        var callback_url = req.query.callback_url;

         //check the consumer
        var consumerExist = true;
        if(consumerExist){
            var clientIp = requestIp.getClientIp(req);
            console.log("client ip:  "+clientIp);
            //sess.callback_url = clientIp+callback_url;
            //sess.consumer_token = token;
            var oauthSessionInfo = JSON.stringify({ consumer: key ,callback_url:clientIp+callback_url });
            var expiresDate = Math.floor(Date.now() / 1000);
            console.log(oauthSessionInfo +"********"+expiresDate);
            var oauthSession = new OAuthSession(session_id,oauthSessionInfo,expiresDate);
            
            sessionService.save(oauthSession,function(err){
                if(err != null && err != undefined){
                    res.status(500).send("authorize failed.");
                }else{
                    // 数据以json形式返回
                    var temp = { consumer_token: session_id };
                    console.log("send response:  "+JSON.stringify(temp));
                    res.status(200).send(JSON.stringify(temp));
                } 
            });
        }else{
            res.status(403).send("unauthorized");
        }
    }
    
});

// set routes
app.use('/oauth/token', function(req, res) {
    
    var session_id = rs.alphaLower(30);
    
    console.log(req.body);
    
    /*sessionService.getOAuthSession(req.query.session_uuid,function(data){
        
        console.log("data from the session **************************");
        console.log(data);
        sess = JSON.parse(data[0].session);
        
        var callback_url = data[0].session.callback_url;
        
        
    });*/
    
    var oauthSession = new OAuthSession(session_id,JSON.stringify({ user: req.body.username , consumer:'' }),Math.floor(Date.now() / 1000));
    sessionService.save(oauthSession,function(err){
        if(err != null && err != undefined){
            res.status(500).send("authorize failed.");
        }else{
            //res.end(rs.alphaLower(20));
            res.redirect(301, 'http://localhost:3000/oauth/callback?resource_token='+session_id);
        } 
    });
     
});

app.use('/oauth/resource', function(req, res) {
    
    if (req.method == 'POST'){
        console.log(req.body);
        var resource_token = req.body.resource_token;
        
        sessionService.getOAuthSession(resource_token,function(data){
        
            console.log("data from the session **************************");
            console.log(data);
            
            //this part do the permission check
            
            
            var temp = { check : true };
            console.log("send response:  "+JSON.stringify(temp));
            res.status(200).send(JSON.stringify(temp));


        });

    }
    
    if (req.method == 'GET'){
        console.log(req.query);
        var resource_token = req.query.resource_token;
        
        sessionService.getOAuthSession(resource_token,function(data){
        
            console.log("data from the session **************************");
            console.log(data);
            
            //this part do the permission check
            
            
            var temp = { check : true };
            console.log("send response:  "+JSON.stringify(temp));
            res.status(200).send(JSON.stringify(temp));


        });
    }
    
});