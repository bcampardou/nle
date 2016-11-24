const router = require('express').Router(),
    keytool = require('../key-tool'),
    logger = require('../logger');

// define wich hostname are valid as param
router.param("hostname", function(req, res, next, hostname) {
    if(!hostname.match(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/))
        //hostname is invalid
        return next(new Error('Hostname parameter is invalid'));
    else return next();
});

router.get('/', function(req, res, next) {
    res.send('Seriously, what are you trying to do ?');
});

router.get('/:hostname/structure', function(req,res,next) {
    var apiKey = req.query.key;
    
    keytool.checkKey(req.params.hostname, apiKey)
        .then(function() {
            var hostname = req.params.hostname;
            logger.getMapping(hostname)
                .then(function(response) {        
                    return res.jsonp({ "structure": response[hostname].mappings.log.properties });
                }, function(err) { 
                    return next(err) 
                });
        }, next);
});

router.put('/:hostname', function(req, res, next) {
    var apiKey = req.query.key;
    keytool.checkKey(req.params.hostname, apiKey)
        .then(function(registeredKey) {
            logger.log(req.params.hostname, req.body)
                .then(function(reply){ 
                    return res.send(reply);
                }, function(err) { 
                    return next(err); 
                })
                .catch(next);
        })
        .catch(next);
});

// Get the registered logs of the :hostname index
router.get('/:hostname/:query?', function(req, res, next) {
    var apiKey = req.query.key;

    keytool.checkKey(req.params.hostname, apiKey)
        .then(function() {
            var body = req.params.query;
            var query = {
                index: req.params.hostname,
                type: 'log',
                size: 9999,
                body: {
                    "sort" : [
                        { "createdAt" : {"order" : "desc"}},
                    ],
                    "query": {
                    }
                }
            };
            if(typeof body === 'string') {
                query.body.query = {
                        "match": {
                        "body": body
                        }
                    };
            } else {
                query.body.query = {
                        "match_all" : {}
                    };
            }
            logger.search(query)
                .then(function (logs) {
                    var hits = logs.hits.hits;
                    return res.jsonp(hits);
                }, function (err) {
                    console.log(err.message);
                    return next(err);
                });
        }, function (err) {
            console.log(err);
            return next(err);
        });
});

module.exports = router;