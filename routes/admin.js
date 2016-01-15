var express = require('express');
var util = require('util');
var config = require('config');
var router = express.Router();
var keytool = require('../key-tool');

router.get('/keys', function(req, res, next) {
    var apiKey = req.query.key;
    if(apiKey == undefined) {
        // bad api key
        res.writeHead(401);
        res.json('No API key defined.');
    }
    
    keytool.getHosts(apiKey, function(error, reply) {
        if(error != null) {
            res.writeHead(400);
            res.json(error.message);
        }
        
        res.jsonp(reply);
    });
});

module.exports = router;