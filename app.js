var elasticsearch = require('elasticsearch');
var mongodb = require('mongodb');
var async = require('async');
var config = require('./config/default');

var MongoClient = mongodb.MongoClient;

var esClient = new elasticsearch.Client({
    host: config.es_host,
    log: config.es_log_level
});

MongoClient.connect(config.db_url, function(err, db) {
    var collection;
    var cursor;
    var count = 0;
    var currentItem;
    var bulkArray = [];

    if (err) {
        console.log(err);
        return;
    }

    console.log("Connected succesfully to MongoDB server");

    // Get collection and cursor
    collection = db.collection(config.db_collection);
    cursor = collection.find().batchSize(config.db_batch_size);

    async.whilst(
        function () { return currentItem !== null; },
        function (callback) {
            cursor.nextObject(function (err, item) {
                var docId;

                if (err)
                    return callback(err, null);

                currentItem = item;
                if (currentItem === null)
                    return callback (null, count);

                count = count + 1;

                // Fill the array
                docId = item._id.toString();
                delete item._id;
                bulkArray.push({index: {_index: config.es_index, _type: config.es_type, _id: docId}});
                bulkArray.push(item);
                
                if ((count % config.es_bulk_size) !== 0) {
                    // Do nothing and continue
                    callback(null, count);
                } else {    
                    // Write to index and clean the array
                    esClient.bulk({
                        body: bulkArray
                    }, function (err, resp) {
                        if (err)
                            return callback(err, null);

                        bulkArray = [];
                        if (resp.errors)
                            console.log(resp);
                        console.log('Indexed ' + count + ' documents');
                        callback(null, count);
                    });
                }
            });
        },
        function (err, n) {
            if (err) {
                console.log(err);
                db.close();
                return; 
            }

            // Index remaining elements
            if (bulkArray.length > 0) {
                esClient.bulk({
                        body: bulkArray
                    }, function (err, resp) {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        console.log('Indexed ' + bulkArray.length / 2 + ' documents');
                        console.log('Total elements indexed: ' + n);
                        db.close();
                    });
            } else {
                console.log('Total elements indexed: ' + n);
                db.close();
            }
        });
});
