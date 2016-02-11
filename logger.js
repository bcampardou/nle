var util = require('util'),
    config = require('config'),
    elasticsearch = require('elasticsearch');

var esclient = elasticsearch.Client({
    hosts: config.get("ElasticSearch.hosts")
});

console.log("Using ElasticSearch @ " + config.get("ElasticSearch.hosts"));

module.exports = {
    log: function(hostname, document, callback) {
        esclient.create({
                index: hostname,
                type: 'log',
                body: document
            }, callback);
    },
    search: function(query, successCallback, errorCallback) {
        esclient.search(query).then(successCallback, errorCallback);
    }
}
