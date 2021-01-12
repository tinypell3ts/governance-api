const algosdk = require("algosdk");
require("dotenv").config();

const server = process.env.INDEXER_URL;
const port = "";
const token = {
  "X-API-Key": process.env.PURESTAKE_TOKEN
};
let algodIndexer = new algosdk.Indexer(token, server, port);

module.exports = algodIndexer;
