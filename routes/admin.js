var express = require('express');
var util = require('util');
var config = require('config');
var router = express.Router();
var keytool = require('../key-tool');
var logger = require('../logger');

// define wich hostname are valid as param
router.param("hostname", function(req, res, next, hostname) {
    if(!hostname.match(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/))
        //hostname is invalid
        return next(new Error('Hostname parameter is invalid'));
    
    return next();
});

router.put('/register/:hostname', function(req, res, next) {
    var apiKey = req.query.key;
    var hostname = req.params.hostname;
    if(apiKey == undefined) {
        //bad api key
        return next(new Error('No API key defined'));
    }
    
    keytool.find('*', function(error, reply) {
        if(error != null) {
            return next(error);
        }
        
        if(reply == apiKey) {
            keytool.register(hostname, function(error, reply) {
                if(error != null) {
                    return next(error);
                }
                
                res.json(reply);
            });
        }
        else {
            //bad api key
            return next(new Error('Bad API key'));
        }
    });
});

router.delete('/:hostname/:type', function(req, res, next) {
    var apiKey = req.query.key;
    var hostname = req.params.hostname;
    var type = req.params.type;
    if(apiKey == undefined) {
        //bad api key
        return next(new Error('No API key defined'));
    }
    
    keytool.checkKey(hostname, apiKey, function(err, reply) {
        if(err !== null) return next(err);
        
        logger.delete(hostname, type, function(response) {
            res.json('OK');
        }, function(error) {
            next(error);
        });
    });
});

router.get('/hosts', function(req, res, next) {
    var apiKey = req.query.key;
    if(apiKey == undefined) {
        // bad api key
        return next(new Error('Bad API key'));
    }
    
    keytool.getHosts(apiKey, function(error, reply) {
        if(error != null) {
            return next(error);
        }
        
        res.jsonp(reply);
    });
});



router.get('/keys/:hostname', function(req, res, next) {
    var apiKey = req.query.key;
    var hostname = req.params.hostname;
    if(apiKey == undefined) {
        //bad api key
        return next(new Error('No API key defined'));
    }
    
    keytool.find('*', function(error, reply) {
        if(error != null) {
            return next(new Error('Error getting the admin api key.'));
        }
        
        if(reply == apiKey) {
            keytool.find(hostname, function(error, reply) {
                if(error != null) {
                    return next(error);
                }
                
                res.jsonp(reply);
            });
        }
        else {
            //bad api key
            return next(new Error('Bad API key'));
        }
    });
});

module.exports = router;