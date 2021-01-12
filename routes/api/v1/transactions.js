const algoSdk = require("algosdk");
const algodClient = require("../../../services/algorand/client");
const algodIndexer = require("../../../services/algorand/indexer");
const waitForConfirmation = require("../../../utils/waitForConfirmation");
const handleError = require("../../../utils/errorHandling");
require("dotenv").config();

const newTransaction = async (req, res) => {
  try {
    let myAccount = algoSdk.mnemonicToSecretKey(req.body.passphrase);
    let params = await algodClient.getTransactionParams().do();
    const receiver = req.body.receiver;
    const amount = req.body.amount * 1000000;
    let note = undefined;

    if (req.body.note) {
      const enc = new TextEncoder();
      note = enc.encode(req.body.note);
    }

    console.log("received", receiver);
    console.log("amount", amount);
    console.log("note", note);

    let txn = algoSdk.makePaymentTxnWithSuggestedParams(
      myAccount.addr,
      receiver,
      amount,
      undefined,
      note,
      params
    );
    let signedTxn = txn.signTxn(myAccount.sk);
    let txId = txn.txID().toString();

    await algodClient.sendRawTransaction(signedTxn).do();

    await waitForConfirmation(algodClient, txId);

    let confirmedTxn = await algodClient
      .pendingTransactionInformation(txId)
      .do();

    res.json({
      transaction: {
        id: txId,
        ...confirmedTxn.txn.txn
      }
    });
  } catch (e) {
    console.log("error", e);
    handleError(res, e);
  }
};

const sendAlgosToVoter = async (req, res) => {
  const { receiver, amount } = req.body;
  try {
    let myAccount = algoSdk.mnemonicToSecretKey(process.env.CREATOR_PASSPHRASE);
    console.log("MY", myAccount);
    let params = await algodClient.getTransactionParams().do();

    let note = undefined;

    if (req.body.note) {
      const enc = new TextEncoder();
      note = enc.encode(req.body.note);
    }

    console.log("received", receiver);
    console.log("amount", amount);
    console.log("note", note);

    let txn = algoSdk.makePaymentTxnWithSuggestedParams(
      myAccount.addr,
      receiver,
      amount,
      undefined,
      note,
      params
    );
    let signedTxn = txn.signTxn(myAccount.sk);
    let txId = txn.txID().toString();

    await algodClient.sendRawTransaction(signedTxn).do();

    await waitForConfirmation(algodClient, txId);

    let confirmedTxn = await algodClient
      .pendingTransactionInformation(txId)
      .do();

    res.json({
      transaction: {
        id: txId,
        ...confirmedTxn.txn.txn
      }
    });
  } catch (e) {
    console.log("error", e);
    handleError(res, e);
  }
};

module.exports = {
  newTransaction,
  sendAlgosToVoter
};
