var defaults = module.exports = {
  // database host. defaults to localhost
  host: 'localhost',

  //database user's name
  user: 'admin',

  //name of database to connect
  database: 'userservice',

  //database user's password
  password: 'admin',

  // a Postgres connection string to be used instead of setting individual connection items
  // NOTE:  Setting this value will cause it to override any other value (such as database or user) defined
  // in the defaults object.
  connectionString : undefined,

  //database port
  port: 5432,

  //number of rows to return at a time from a prepared statement's
  //portal. 0 will return all rows at once
  rows: 0,

  // binary result mode
  binary: false,

  //Connection pool options - see https://github.com/coopernurse/node-pool
  //number of connections to use in connection pool
  //0 will disable connection pooling
  poolSize: 10,

  //max milliseconds a client can go unused before it is removed
  //from the pool and destroyed
  poolIdleTimeout: 30000,

  //frequency to check for idle clients within the client pool
  reapIntervalMillis: 1000,

  //if true the most recently released resources will be the first to be allocated
  returnToHead: false,

  //pool log function / boolean
  poolLog: false,

  client_encoding: "",

  ssl: false,

  application_name: undefined,
  fallback_application_name: undefined,

  parseInputDatesAsUTC: false
};

//parse int8 so you can get your count values as actual numbers
module.exports.__defineSetter__("parseInt8", function(val) {
  require('pg-types').setTypeParser(20, 'text', val ? parseInt : function(val) { return val; });
});
