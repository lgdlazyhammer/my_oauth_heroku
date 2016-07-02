var pg = require('pg');
var defaults = require('./defaults.js');
var conString = "postgres://"+defaults.user+":"+defaults.password+"@"+defaults.host+"/"+defaults.database;

//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 10 (also configurable)
var globalClient = null;
var globalDone = null;

module.exports = {
	queryPerConnection: function(query, CALLBACK){
		pg.connect(conString, function(err, client, done) {
			if(err) {
				return null;
			}else{
				client.query('SET search_path = admin', function(err, result) {
					if(err) {
						done();
						return err;
					}else{
						client.query(query, function(err, result) {
						
							if(err) {
								done();
								return err;
							}else{
								CALLBACK(result);
								done();
								return null;
							}
						});
						return null;
					}
				});
			}
		});
	},
	query: function(query, CALLBACK){
		if(globalClient == null || globalDone == null){
			
			pg.connect(conString, function(err, client, done) {
				globalClient = client;
				globalDone = done;
				if(err) {
					return null;
				}else{
					client.query('SET search_path = admin', function(err, result) {
						if(err) {
							done();
							return err;
						}else{
							client.query(query, function(err, result) {
							
								if(err) {
									return err;
								}else{
									CALLBACK(result);
									return null;
								}
							});
							return null;
						}
					});
				}
			});
		}else{
			globalClient.query(query, function(err, result) {
			
				if(err) {
					return err;
				}else{
					CALLBACK(result);
					return null;
				}
			});
		}
	},
	save: function(insertSQLString, value, CALLBACK){
		if(globalClient == null || globalDone == null){
			
			pg.connect(conString, function(err, client, done) {
				globalClient = client;
				globalDone = done;
				if(err) {
					CALLBACK(err);
					return;
				}else{
					
					client.query('SET search_path = admin', function(err, result) {
						if(err) {
							client.end();
							CALLBACK(err);
							return;
						}else{
							client.query(insertSQLString, value,  function(error, results)  
							{  
								if(error)  
								{  
									console.log("ClientReady Error: " + error.message),  
									client.end();  
									CALLBACK(err);
									return;  
								}  
								console.log('Inserted: ' + results.affectedRows + ' row.'),  
								console.log('insert success...\n');  
							});
						}
					});
				}
			});
		}else{
			globalClient.query(insertSQLString, value,  function(error, results)  
			{  
				if(error)  
				{  
					console.log("ClientReady Error: " + error.message);
					globalClient.end();
					CALLBACK(err);
					return;  
				}  
				console.log('Inserted: ' + results.affectedRows + ' row.'),  
				console.log('insert success...\n');  
			});
		}
	},
	done: function(){
		//release the conection to the pool
		globalDone();
	}
}