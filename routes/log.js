var express = require('express');
var util = require('util');
var config = require('config');
var router = express.Router();
var elasticsearch = require('elasticsearch');
var keytool = require('../key-tool');

var esclient = elasticsearch.Client({
    hosts: config.get("ElasticSearch.hosts")
});

console.log("Using elasticsearch @ " + config.get("ElasticSearch.hosts"));

// define wich hostname are valid as param
router.param("hostname", function(req, res, next, hostname) {
  if(!hostname.match(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/))
    //hostname is invalid
    next(new Error('Hostname parameter is invalid'));
   else next();
});

// execute the callback if the api key is ok
var validKey = function(req, res, hostname, callback) {
    var apiKey = req.query.key;
    if(apiKey == undefined) {
            // bad api key
            res.writeHead(401);
            res.end('No API key defined.');
    }
    
    keytool.find(hostname, function(error, reply) {
        if(error != null) {
            console.error(error);
            res.writeHead(500);
            res.end('An error occured');
        }
        
        if (reply != null && reply === apiKey) {
            // Authorized
            callback(req, res);
        }
        else {
            // The key does not correspond to the hostname.
            // Let's see if it is the admin key...
            keytool.find('*', function(error, reply) {
                if(error != null) {
                    console.error(error);
                    res.writeHead(500);
                    res.end('An error occured');
                }
                
                if (reply != null && reply === apiKey) {
                    // API Key is the admin api key
                    // Authorized
                    callback(req, res);
                }
                else {
                    // bad api key
                    res.writeHead(401);
                    res.end('The API key sent is unknown.');
                }
            });
        }
    });
};

// Allow cross origins requests (CORS)
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.get('/', function(req, res, next) {
    res.send('Seriously, what are you trying to do ?');
});

router.put('/:hostname', function(req, res, next) {    
    validKey(req, res, req.params.hostname, function(req, res, next) {
        esclient.create({
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
    validKey(req, res, req.params.hostname, function(req,res,next) {
        var query = {
            index: req.params.hostname,
            type: 'log',
            size: 1000
        };
        if(typeof req.params.query === 'string') {
            query.body = {
                query: {
                    match: {
                    body: req.params.query
                    }
                }
            };
        } else {
            query.body = {
                query : {
                    match_all : {}
                }
            }
        }
        esclient.search(query).then(function (resp) {
            var hits = resp.hits.hits;
            res.jsonp(hits);
        }, function (err) {
            console.trace(err.message);
            res.writeHead(500);
        });
    });
});

// TODO : delete /:hostname/:query? admin

module.exports = router;