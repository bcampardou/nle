var util = require('util'),
    config = require('config'),
    elasticsearch = require('elasticsearch'),
    async = require('async');

var esclient = elasticsearch.Client({
    hosts: config.get("ElasticSearch.hosts")
});

console.log("Using ElasticSearch @ " + config.get("ElasticSearch.hosts"));

module.exports = {
    log: function(hostname, document) {
        return new Promise((resolve, reject) => {
            document.createdAt = Date.now();
            esclient.create({
                    index: hostname,
                    type: 'log',
                    body: document
                }, function(err, reply) {
                    if(err != null) return reject(err);
                    return resolve(reply);
                });
        });
    },
    search: function(query) {
        return esclient.search(query);
    },
    delete: function(hostname, type, successCallback, errorCallback) {
        esclient.search({index:hostname, type:type, size: 9999, body: { query: { "match_all": {} }}})
            .then(function(reply) {
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
    },
    deleteIndex: function(hostname, callback) {
        esclient.indices.exists({"index":hostname}, function(err, response) {
            if (err != null) callback(err);
            if(response === true) {
                return esclient.indices.delete({"index":hostname}, callback);
            }
            return callback(null, "No index to remove");
        });
    },
    getMapping: function(hostname, successCallback, errorCallback) {
        return esclient.indices.getMapping({
            index: hostname,
        });
    }
}
