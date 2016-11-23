const router = require('express').Router(),
    util = require('util'),
    config = require('config'),
    keytool = require('../key-tool'),
    logger = require('../logger');

// define wich hostname are valid as param
router.param("hostname", function(req, res, next, hostname) {
    if(!hostname.match(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/))
        //hostname is invalid
        return next(new Error('Hostname parameter is invalid'));
    
    return next();
});


router.delete('/:hostname', function(req, res, next) {
    var apiKey = req.query.key;
    var hostname = req.params.hostname;
    
    keytool.checkKey("*", apiKey)
        .then( function() {        
            logger.deleteIndex(hostname, function(error, response) {
                if(error) {
                    return next(error);
                }
                keytool.deleteKey(apiKey, hostname, function(err) { if(err) return next(err); });
                return res.jsonp(response);
            });
        }, next);
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
    
    keytool.checkKey("*", apiKey)
        .then(function() {
            logger.delete(hostname, type, function(response) {
                return res.send('OK');
            }, function(error) {
                return next(error);
            });
        }, next);
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
        
        return res.jsonp(reply);
    });
});

router.get('/keys/:hostname', function(req, res, next) {
    var apiKey = req.query.key;
    var hostname = req.params.hostname;
    if(apiKey == undefined) {
        //bad api key
        return next(new Error('No API key defined'));
    }
    
    keytool.checkKey('*', apiKey)
        .then(function(registeredKey) {
            keytool.find(hostname, function(error, reply) {
                if(error != null) {
                    return next(error);
                }
                
                return res.jsonp(reply);
            });
        }, next);
});

module.exports = router;