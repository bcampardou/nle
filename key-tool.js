var uuid = require('node-uuid'),
  config = require('config'),
  redis = require("redis"),
  client = redis.createClient(
    config.get("Redis.port"), config.get("Redis.host"), config.get("Redis.options")
  );

module.exports = {
    find: function(hostname, callback) {
        client.get(hostname, function(error, reply) {
            if(error != null) {
                console.error(error);
                if(callback !== null) {
                    callback(error, reply);
                }
            }
            
            if(callback !== null) {
                callback(error, reply);
            }
        });
    },
    register: function(hostname, callback) {
        client.get(hostname, function(error, reply) {
            if(error != null) {
                console.error(error);
                callback(error, reply);
            }
            
            if(reply == null) {
                var apikey = uuid.v4();
                // Write in redis
                client.set(hostname, apikey);
                reply = apikey;
                callback(error, apikey);
            } else {
                callback(error, null);
            }
        });
    },
    getHosts: function(apiKey, callback) {
        client.get('*', function(error, reply) {
            if(error != null) {
                console.error(error);
                callback(error, reply);
            }
            
            if(reply == null) {
                error = new Error('No administration key registered');
            } else {
                if (reply == apiKey) {
                    client.keys('*', function (err, keys) {
                        if (err) return console.log(err);
                        
                        keys.forEach(function(item,i) {
                            if(item === '*') keys.splice(i, 1);
                        });
                        
                        callback(err, keys);
                    });
                }
                else {
                    error = new Error('The api key does not match the registered administration key');
                    callback(error, null);
                }
            }
        });
    }
};