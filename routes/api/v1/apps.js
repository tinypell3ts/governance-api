const algoSdk = require("algosdk");
const algodClient = require("../../../services/algorand/client");
const algodIndexer = require("../../../services/algorand/indexer");
const handleError = require("../../../utils/errorHandling");
const { waitForConfirmation, signAndSendTx } = require("../../../utils/index");
require("dotenv").config();

const getApp = async (req, res) => {
  const { id } = req.params;
  try {
    let response = await algodIndexer.lookupApplications(id).do();

    res.json({ response });
  } catch (e) {
    console.log("error", e);
    handleError(res, e);
  }
};

const getAppState = async (req, res) => {
  const { id } = req.params;
  try {
    let response = await algodIndexer.lookupApplications(id).do();
    const globalState = response.application.params["global-state"];
    const state = globalState.map((s) => ({
      key: Buffer.from(s.key, "base64").toString(),
      value: s.value.uint
    }));

    const finalState = state.slice(1);
    res.json({ state: finalState });
  } catch (e) {
    console.log("error", e);
    handleError(res, e);
  }
};

const appOptIn = async (req, res) => {
  try {
    const { sender } = req.body;
    const { id } = req.params;

    console.log(typeof id);

    // call application with arguments
    let register = "register";
    let appArgs = [];
    appArgs.push(new Uint8Array(Buffer.from(register)));

    let from = await algoSdk.mnemonicToSecretKey(sender);
    let params = await algodClient.getTransactionParams().do();
    let optInTxn = algoSdk.makeApplicationOptInTxn(
      from.addr,
      params,
      parseInt(id),
      appArgs
    );

    let tokenOptIn = await signAndSendTx(algodClient, from, optInTxn);

    // wait for transaction to be confirmed
    let confirmedAppOptIn = await waitForConfirmation(
      algodClient,
      tokenOptIn.txId
    );

    res.json({
      appOptin: {
        status: "successful",
        ID: tokenOptIn.txId,
        appID: appID,
        from: central.addr,
        type: confirmedAppOptIn.txn.txn.type
      }
    });
  } catch (e) {
    console.log("error", e);
    handleError(res, e);
  }
};

module.exports = {
  appOptIn,
  getApp,
  getAppState
};
