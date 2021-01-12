const express = require("express");
const router = express.Router();
const {
  createAccount,
  getAccount,
  getAccountTransactions
} = require("./routes/api/v1/accounts");
const {
  newTransaction,
  sendAlgosToVoter
} = require("./routes/api/v1/transactions");
const {
  createAsset,
  getAssetsForSingleAccount,
  sendAsset,
  assetOptIn,
  getAsset,
  getAssetBalances
} = require("./routes/api/v1/assets");
const { appOptIn, getApp, getAppState } = require("./routes/api/v1/apps");
const { appVote } = require("./routes/api/v1/voting");
const { register } = require("./routes/api/v1/register");

// ACCOUNTS
router.get("/accounts/create", createAccount);
router.get("/accounts/:id", getAccount);
router.get("/accounts/:id/transactions", getAccountTransactions);
router.get("/accounts/:id/assets", getAssetsForSingleAccount);

// ASSETS
router.post("/assets", createAsset);
router.post("/assets/optin", assetOptIn);
router.post("/assets/send", sendAsset);
router.get("/assets/:id", getAsset);
router.get("/assets/:id/balances", getAssetBalances);

// TRANSACTIONS
router.post("/transactions", newTransaction);
router.post("/funds/topup", sendAlgosToVoter);

// APPS
router.get("/apps/:id", getApp);
router.get("/apps/:id/state", getAppState);
router.post("/apps/:id/optin", appOptIn);

// VOTING
router.post("/vote", appVote);

// REGISTER
router.post("/register", register);

module.exports = router;
