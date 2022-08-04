// Load database with chosen db
const Config = require('../config/config');

const { db_filename='./json', db_config={} } = Config;

const Database = require(db_filename);

const db = new Database(db_config);

module.exports = db;
