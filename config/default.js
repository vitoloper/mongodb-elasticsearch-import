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
