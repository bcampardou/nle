var express = require('express');
var keytool = require('../key-tool');
var logger = require('../logger');
var router = express.Router();

// define wich hostname are valid as param
router.param("hostname", function(req, res, next, hostname) {
    if(!hostname.match(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/))
        //hostname is invalid
        return next(new Error('Hostname parameter is invalid'));
    else return next();
});

// execute the callback if the api key is ok
var validKey = function(hostname, key, callback) {
    var apiKey = key;
    if(apiKey == undefined) {
            // bad api key
            return callback(new Error('No API key defined'));
    }
    
    keytool.find(hostname, function(error, reply) {
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
            keytool.find('*', function(error, reply) {
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
};



router.get('/', function(req, res, next) {
    res.send('Seriously, what are you trying to do ?');
});

router.put('/:hostname', function(req, res, next) {
    var apiKey = req.query.key;
    validKey(req.params.hostname, apiKey, function(err, reply) {
        if(err != null)
            return next(err);
            
        logger.log(req.params.hostname, req.body, function(error, response) {
            if(error != null) {
                return next(error);
            } else {
                res.send(response);
            }
        });
    });
});

router.get('/:hostname/:query?', function(req, res, next) {
    var apiKey = req.query.key;
    validKey(req.params.hostname, apiKey, function(err, reply) {
        if(err != null)
            return next(err);
            
        var query = {
            index: req.params.hostname,
            type: 'log',
            size: 1000
        };
        if(typeof req.params.query === 'string') {
            query.body = {
                "sort" : [
                    { "createdAt" : {"order" : "asc"}},
                ],
                "query": {
                    "match": {
                    "body": req.params.query
                    }
                }
            };
        } else {
            query.body = {
                "sort" : [
                    { "createdAt" : {"order" : "asc"}},
                ],
                "query" : {
                    "match_all" : {}
                }
            }
        }
        logger.search(query, function (resp) {
                var hits = resp.hits.hits;
                res.jsonp(hits);
            }, function (err) {
                console.trace(err.message);
                next(err);
            });
    });
});

// TODO : delete /:hostname/:query? admin

module.exports = router;