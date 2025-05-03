const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');
require('dotenv').config();

const bigquery = new BigQuery({
  projectId: process.env.PROJECT_ID,
  location: 'EU',
  keyFilename: path.join(__dirname, '..', process.env.KEYFILE_PATH)
});

const runQuery = async (query) => {
  const [rows] = await bigquery.query({ query });
  return rows;
};

module.exports = { runQuery };

