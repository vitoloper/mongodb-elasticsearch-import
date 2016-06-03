# mongodb-elasticsearch-import

A tool to import data from MongoDB into Elasticsearch.

## Installation

Clone the repository and install the required modules:

```sh
$ git clone https://github.com/vitoloper/mongodb-elasticsearch-import.git mongodb-elasticsearch-import
$ cd mongodb-elasticsearch-import
$ npm install
```

## Setup

Edit the default configuration file default.js in the config/ directory:

```javascript
module.exports = {
    db_url: 'mongodb://localhost:27017/twitter',
    db_collection: 'tweets',
    db_find_query: {},
    db_batch_size: 100,
    es_host: 'localhost:9200',
    es_log_level: 'error',
    es_index: 'twitter',
    es_type: 'tweet',
    es_bulk_size: 300
};
```

Options are:

* `db_url` - MongoDB database URL.
* `db_collection` - the collection you want to import into Elasticsearch.
* `db_find_query` - the query to perform on the MongoDB collection.
* `db_batch_size` - the number of documents to return in each batch of the response from the MongoDB instance.
* `es_host` - the host on which Elasticsearch is running.
* `es_log_level` - Elasticsearch client logging level.
* `es_index` - the destination index.
* `es_type` - the type in the destination index.
* `es_bulk_size` - number of documents to index in a single step.


## Run

Start the Node.js application:

```sh
$ node app.js
```

## Version
0.9.0

License
----

MIT

