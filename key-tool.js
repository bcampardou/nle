var uuid = require('node-uuid'),
  config = require('config'),
  redis = require("redis"),
  client = redis.createClient(
    config.get("Redis.port"), config.get("Redis.host"), config.get("Redis.options")
  );

console.log("Using redis @ " + config.get("Redis.host") + ":" + config.get("Redis.port"));

var find = function(hostname, callback) {
    client.get(hostname, function(error, reply) {
        if(error != null) {
            console.error(error);
            if(callback !== null) {
                return callback(error);
            }
        }
        
        if(callback !== null) {
            return callback(null, reply);
        }
    });
};

module.exports = {
    find: find,
    register: function(hostname, callback) {
        client.get(hostname, function(error, reply) {
            if(error != null) {
                console.error(error);
                return callback(error);
            }
            
            if(reply == null) {
                var apikey = uuid.v4();
                // Write in redis
                return client.set(hostname, apikey, function(error, reply) {
                    if(error != null)
                        return callback(error);
                        
                    return callback(null, apikey);
                });
                
            } else {
                return callback(error);
            }
        });
    },
    getHosts: function(apiKey, callback) {
        client.get('*', function(error, reply) {
            if(error != null) {
                console.error(error);
                return callback(error);
            }
            
            if(reply == null) {
                callback(new Error('No administration key registered'));
            } else {
                if (reply == apiKey) {
                    client.keys('*', function (err, keys) {
                        if (err) return callback(err);
                        
                        keys.forEach(function(item,i) {
                            if(item === '*') keys.splice(i, 1);
                        });
                        
                        return callback(null, keys);
                    });
                }
                else {
                    return callback(new Error('The api key does not match the registered administration key'));
                }
            }
        });
    },
    deleteKey: function(apiKey, hostname, callback) {
        client.get('*', function(error, reply) {
            if(error != null) {
                console.error(error);
                return callback(error);
            }
            
            if(reply == null) {
                callback(new Error('No administration key registered'));
            } else {
                if (reply == apiKey) {
                    client.del(hostname);
                    return callback(null);
                }
                else {
                    return callback(new Error('The api key does not match the registered administration key'));
                }
            }
        });
    },
    getKeys: function(apiKey, callback) {
        client.get('*', function(error, reply) {
            if(error != null) {
                console.error(error);
                return callback(error);
            }
            
            if(reply == null) {
                return callback(new Error('No administration key registered'));
            } else {
                if (reply == apiKey) {
                    client.keys('*', function(e, keys){
                        if(e) {console.log(e);}
                        client.mget(keys, function(err, values){
                            if(err){ return callback(err, null)}
                            return callback(null, values);
                        });
                    });
                }
                else {
                    error = new Error('The api key does not match the registered administration key');
                    return callback(error);
                }
            }
        });
    },
    // execute the callback if the api key is ok
    checkKey: function(hostname, key, callback) {
        var apiKey = key;
        if(apiKey == undefined) {
                // bad api key
                return callback(new Error('No API key defined'));
        }
        
        find(hostname, function(error, reply) {
            if(error != null) {
                console.error(error);
                callback(error);
            }
            
            if (reply != null && reply === apiKey) {
                // Authorized
                callback(null, reply);
            }
            else {
                // The key does not correspond to the hostname.
                // Let's see if it is the admin key...
                find('*', function(error, reply) {
                    if(error != null) {
                        console.error(error);
                        return callback(error);
                    }
                    
                    if (reply != null && reply === apiKey) {
                        // API Key is the admin api key
                        // Authorized
                        callback(null, reply);
                    }
                    else {
                        // bad api key
                        return callback(new Error('Bad API key'));
                    }
                });
            }
        });
    }
};
