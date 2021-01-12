const algoSdk = require("algosdk");
const algodClient = require("../../../services/algorand/client");
const algodIndexer = require("../../../services/algorand/indexer");
const handleError = require("../../../utils/errorHandling");

const createAccount = (req, res) => {
  try {
    let account = algoSdk.generateAccount();
    let passphrase = algoSdk.secretKeyToMnemonic(account.sk);

    res.json({ account: account.addr, passphrase });
  } catch (e) {
    handleError(res, e);
  }
};

const getAccount = async (req, res) => {
  try {
    let address = req.params.id;
    let accountInfo = await algodClient.accountInformation(address).do();

    res.json({ accountInfo });
  } catch (e) {
    handleError(res, e);
  }
};

const getAccountTransactions = async (req, res) => {
  try {
    let address = req.params.id;
    let transactions = await algodIndexer
      .searchForTransactions()
      .address(address)
      .do();

    res.json({ transactions });
  } catch (e) {
    handleError(res, e);
  }
};

module.exports = {
  createAccount,
  getAccount,
  getAccountTransactions
};
