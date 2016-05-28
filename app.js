var elasticsearch = require('elasticsearch');
var mongodb = require('mongodb');
var async = require('async');

var MongoClient = mongodb.MongoClient;

var url = 'mongodb://localhost:27017/twitter';
var collectionName = 'tweets';

var esClient = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error'
});

MongoClient.connect(url, function(err, db) {
    var count = 0;

    if (err) {
        console.log(err);
        return;
    }

    console.log("Connected succesfully to MongoDB server");

    // Get collection and cursor
    var collection = db.collection(collectionName);
    var cursor = collection.find();
    var count = 0;
    var currentItem;
    var bulkArray = [];

    async.whilst(
        function () { return currentItem !== null },
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
                bulkArray.push({index: {_index: 'twitter', _type: 'tweet', _id: docId}});
                bulkArray.push(item);
                
                if ((count % 100) !== 0) {
                    callback(null, count);
                } else {    // Write to index and clean the array
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
