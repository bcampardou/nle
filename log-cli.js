var uuid = require('node-uuid'),
  config = require('config'),
  redis = require("redis"),
  client = redis.createClient(
    config.get("Redis.port"), config.get("Redis.host"), config.get("Redis.options")
  );

var help =  "usage: to do...";

var tasks = {};

tasks.help = function(){  
  console.log(help);
  process.exit();
};


tasks.apiKeyGen = function(hostname) {
  console.log("\n------- not implemented ------\n");
  client.get(hostname, function(error, reply) {
    if(typeof error !== 'undefined') {
      throw error;
    }
    
    if(typeof reply === 'undefined') {
      var apikey = uuid.v4();
      // Write in redis
      client.set(hostname, apikey);
      console.log("Your API Key for '" + hostname + "' is: " + apikey + "\nPlease write it carefully.")
    } else {
      throw new Error('A key already exists for the hostname ' + hostname);
    }
    process.exit();
  });
};

var argv = process.argv.slice(2);

if(argv[0] === "--help" || argv[0] === "-h") {  
   tasks.help();
} else if(argv[0] === "keygen") {
  if(argv[1] === "--hostname" && typeof argv[2] === "string") {
    var hostname = argv[2];
    tasks.apiKeyGen(hostname);
  } else {
    console.log("You have to specify a hostname with '--hostname' followed by a string")
  }
}


module.exports = tasks;