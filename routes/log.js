var express = require('express');
var util = require('util');
var router = express.Router();
var elasticsearch = require('elasticsearch');

var client = elasticsearch.Client({
  hosts: [
    'localhost:9200'
  ]
});

router.get('/', function(req, res, next) {
  res.send('What did you expect ?');
});

router.put('/:hostname', function(req, res, next) {
  console.info('Hostname : ' + req.params.hostname);
  client.create({
    index: req.params.hostname,
    type: 'log',
    body: req.body
  }, function (error, response) {
    if(typeof error === 'undefined') {
      res.send(response);
    }
    else {
      res.send(error);
    }
  });
});

module.exports = router;