var util = require('util'),
    config = require('config'),
    elasticsearch = require('elasticsearch'),
    async = require('async');

var esclient = elasticsearch.Client({
    hosts: config.get("ElasticSearch.hosts")
});

console.log("Using ElasticSearch @ " + config.get("ElasticSearch.hosts"));

module.exports = {
    log: function(hostname, document, callback) {
        document.createdAt = Date.now();
        esclient.create({
                index: hostname,
                type: 'log',
                body: document
            }, callback);
    },
    search: function(query, successCallback, errorCallback) {
        esclient.search(query).then(successCallback, errorCallback);
    },
    delete: function(hostname, type, successCallback, errorCallback) {
        esclient.search({index:hostname, type:type, size: 9999, body: { query: { "match_all": {} }}}).then(function(reply) {
            var ids = new Array();
            var results = reply.hits.hits;
            for(var i in results) {
                ids.push(results[i]._id);
            }
            
            async.eachSeries(ids, function iteratee(item, callback) {
                esclient.delete({
                    index: hostname,
                    type: type,
                    id: item
                });
                callback();
            }, function done() {
                return successCallback();
            });
            
        }, errorCallback);
    }
}
