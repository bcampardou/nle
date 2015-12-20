var express = require('express');
var util = require('util');
var config = require('config');
var router = express.Router();
var elasticsearch = require('elasticsearch');

var client = elasticsearch.Client({
  hosts: config.get("ElasticSearch.hosts")
});

console.log("Using elasticsearch @ " + config.get("ElasticSearch.host"));

router.get('/', function(req, res, next) {
  res.send('What did you expect ?');
});

router.put('/:hostname', function(req, res, next) {
  console.info('PUT -> /log/:hostname');
  console.info('hostname: ' + req.params.hostname);
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

router.get('/:hostname/:query?', function(req, res, next) {
  console.info('GET -> /log/:hostname');
  console.info('hostname: ' + req.params.hostname);
  console.info('We should get logs for this hostname');
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

module.exports = router;