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

router.put('/', function(req, res, next) {
  client.create({
    index: 'localhost',
    type: 'log',
    body: {
      title: 'Test 1',
      tags: ['y', 'z'],
      published: true,
      published_at: '2013-01-01',
      counter: 1
    }
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