const uuid = require('node-uuid'),
    config = require('config'),
    redis = require("redis"),
    redisClient = redis.createClient(
        config.get("Redis.port"), config.get("Redis.host"), config.get("Redis.options")
    );

console.log("Using redis @ " + config.get("Redis.host") + ":" + config.get("Redis.port"));

var findFunction = function(hostname, callback) {
    redisClient.get(hostname, function(error, registeredKey) {
        if(error != null) {
            console.error(error);
            if(typeof callback === 'function') {
                return callback(error);
            }
        }
        
        if(typeof callback === 'function') {
            return callback(null, registeredKey);
        }
    });
};

module.exports = {
    find: findFunction,
    register: function(hostname, callback) {
        redisClient.get(hostname, function(error, reply) {
            if(error != null) {
                console.error(error);
                return callback(error);
            }
            
            if(reply == null) {
                var apikey = uuid.v4();
                // Write in redis
                return redisClient.set(hostname, apikey, function(error, reply) {
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
        redisClient.get('*', function(error, reply) {
            if(error != null) {
                console.error(error);
                return callback(error);
            }
            
            if(reply == null) {
                callback(new Error('No administration key registered'));
            } else {
                if (reply == apiKey) {
                    redisClient.keys('*', function (err, keys) {
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
        redisClient.get('*', function(error, reply) {
            if(error != null) {
                console.error(error);
                return callback(error);
            }
            
            if(reply == null) {
                callback(new Error('No administration key registered'));
            } else {
                if (reply == apiKey) {
                    redisClient.del(hostname);
                    return callback(null);
                }
                else {
                    return callback(new Error('The api key does not match the registered administration key'));
                }
            }
        });
    },
    getKeys: function(apiKey, callback) {
        redisClient.get('*', function(error, reply) {
            if(error != null) {
                console.error(error);
                return callback(error);
            }
            
            if(reply == null) {
                return callback(new Error('No administration key registered'));
            } else {
                if (reply == apiKey) {
                    redisClient.keys('*', function(e, keys){
                        if(e) {console.log(e);}
                        redisClient.mget(keys, function(err, values){
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
    // Promise => error if api key is bad. Else return the registered API Key
    checkKey: function(hostname, key) {
        return new Promise((resolve, reject) => {
            var apiKey = key;
            if(apiKey == undefined) {
                // bad api key
                return reject(new Error('No API key defined'));
            }
            
            findFunction(hostname, function(error, hostnameKey) {
                if(error != null) {
                    console.error(error);
                    return reject(error);
                }
                
                if (hostnameKey != null && hostnameKey === apiKey) {
                    // Authorized
                    return resolve(hostnameKey);
                } else if(hostname === '*') {
                    return reject(new Error('No API key defined'));
                }
                
                // The key does not correspond to the hostname.
                // Let's see if it is the admin key...
                findFunction('*', function(error, adminKey) {
                    if(error != null) {
                        console.error(error);
                        return reject(error);
                    }
                    
                    if (adminKey != null && adminKey === apiKey) {
                        // API Key is the admin api key
                        // Authorized
                        return resolve(adminKey);
                    }
                    // bad api key
                    return reject(new Error('Bad API key'));
                });
            });
        });
    }
};
