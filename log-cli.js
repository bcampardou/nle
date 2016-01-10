var uuid = require('node-uuid'),
  config = require('config'),
  redis = require("redis"),
  client = redis.createClient(
    config.get("Redis.port"), config.get("Redis.host"), config.get("Redis.options")
  );

var argv = process.argv.slice(2);

var help =  "usage: to do...";

var tasks = {};
tasks['help'] = function(){  
  console.info(help);
  process.exit();
};

tasks['findkey'] = function() {
    var hostname = '';
    if(argv[0] === "findkey") {
        if(argv[1] === "--hostname" && typeof argv[2] === "string") {
            hostname = argv[2];
        } else {
            console.log("You have to specify a hostname with '--hostname' followed by a string");
            return;
        }
    }
    else return;
    
    
    console.log(hostname);
    
    client.get(hostname, function(error, reply) {
        if(error != null) {
            console.error(error);
            throw error;
        }
        
        if(reply == null) {
            console.info("No API key registered for this hostname. \nYou can create a new key using the 'keygen --hostname [myhostname]' command.");
        } else {
            console.info("The registered key for '" + hostname + "' is : " + reply);
        }
        process.exit();
    });
};

tasks['keygen'] = function() {
    var hostname = '';
  
    if(argv[0] === "keygen") {
        if(argv[1] === "--hostname" && typeof argv[2] === "string") {
            hostname = argv[2];
        } else {
            console.log("You have to specify a hostname with '--hostname' followed by a string")
        }
    }
    
    client.get(hostname, function(error, reply) {
        if(error != null) {
            console.error(error);
        throw error;
        }
        
        if(reply == null) {
            var apikey = uuid.v4();
            // Write in redis
            client.set(hostname, apikey);
            console.info("Your API Key for '" + hostname + "' is: " + apikey + "\nPlease write it carefully.")
        } else {
            console.error('A key already exists for the hostname ' + hostname);
        }
        process.exit();
    });
};

var executeTask = (function(name) {
    if(name === '--help') {
        tasks['help']();
    }
    else if(typeof name === 'string' && typeof tasks[name] === 'function') {
        tasks[name]();
    } 
    else {
        console.info(name + ' is not a valid command.\nYou can use --help to get informations about the log-cli usage.');
    }
})(argv[0]);

module.exports = tasks;