var express = require('express');
var util = require('util');
var config = require('config');
var router = express.Router();
var elasticsearch = require('elasticsearch');
var redis = require("redis"),
    redisClient = redis.createClient(
        config.get("Redis.port"), config.get("Redis.host"), config.get("Redis.options")
    );

var client = elasticsearch.Client({
    hosts: config.get("ElasticSearch.hosts")
});

console.log("Using elasticsearch @ " + config.get("ElasticSearch.hosts"));
console.log("Using redis @ " + config.get("Redis.host") + ":" + config.get("Redis.port"));


// execute the callback if the api key is ok
var checkApiKey = function(req, res, hostname, callback) {
    console.log('checkApiKey : ' + req.query.key);
    var apiKey = req.query.key;
    if(apiKey == undefined) {
            // bad api key
            res.writeHead(401);
            res.end('No API key defined.');
    }
    redisClient.get(hostname, function(error, reply) {
        if(error != null) {
            console.error(error);
            res.writeHead(500);
            res.end('An error occured');
            throw error;
        }
        
        if (reply != null && reply === apiKey) {
            callback(req, res);
        }
        else {
            // bad api key
            res.writeHead(401);
            res.end('The API key sent is unknown.');
        }
    });
};

router.get('/', function(req, res, next) {
    res.writeHead(418);
    res.send('You should give me what I need to make your coffee...');
});

router.put('/:hostname', function(req, res, next) {
    console.info('PUT -> /log/:hostname with hostname: ' + req.params.hostname);
    
    checkApiKey(req, res, req.params.hostname, function(req, res, next) {
        client.create({
            index: req.params.hostname,
            type: 'log',
            body: req.body
        }, function (error, response) {
            if(error == null) {
                res.send(response);
            }
            else {
                res.send(error);
            }
        });
    });
  
});

router.get('/:hostname/:query?', function(req, res, next) {
    console.info('GET -> /log/:hostname with hostname: ' + req.params.hostname);
    checkApiKey(req, res, req.params.hostname, function(req,res,next) {
        var query = {
            index: req.params.hostname,
            type: 'log',
        };
        if(typeof req.params.query === 'string') {
            query.body = {
                query: {
                    match: {
                    body: req.params.query
                    }
                }
            };
        }
        client.search(query).then(function (resp) {
            var hits = resp.hits.hits;
            res.send(hits);
        }, function (err) {
            console.trace(err.message);
        });
    });
});

module.exports = router;