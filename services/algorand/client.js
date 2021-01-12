const algosdk = require("algosdk");
require("dotenv").config();

const server = process.env.CLIENT_URL;
const port = "";
const token = {
  "X-API-Key": process.env.PURESTAKE_TOKEN
};

let algodClient = new algosdk.Algodv2(token, server, port);

module.exports = algodClient;
