const algoSdk = require("algosdk");
const algodClient = require("../../../services/algorand/client");
const handleError = require("../../../utils/errorHandling");
const { waitForConfirmation, intToUint8Array } = require("../../../utils");
require("dotenv").config();

const appVote = async (req, res) => {
  const { voter, choice, assetID, appID } = req.body;

  let from = await algoSdk.mnemonicToSecretKey(voter);

  let params = await algodClient.getTransactionParams().do();

  let vote = "vote";
  let appArgs = [];
  appArgs.push(new Uint8Array(Buffer.from(vote)));
  appArgs.push(new Uint8Array(Buffer.from(choice)));
  appArgs.push(intToUint8Array(parseInt(assetID)));

  try {
    // Call the App
    let transaction1 = algoSdk.makeApplicationNoOpTxn(
      from.addr,
      params,
      appID,
      appArgs
    );

    // Make Asset Transfer
    let transaction2 = algoSdk.makeAssetTransferTxnWithSuggestedParams(
      from.addr,
      process.env.CREATOR_ACCOUNT,
      undefined,
      undefined,
      1,
      undefined,
      assetID,
      params
    );

    let txns = [transaction1, transaction2];
    let txgroup = algoSdk.assignGroupID(txns);

    let signedTxn1 = transaction1.signTxn(from.sk);
    let signedTxn2 = transaction2.signTxn(from.sk);

    let signed = [];
    signed.push(signedTxn1);
    signed.push(signedTxn2);

    let tx = await algodClient.sendRawTransaction(signed).do();

    await waitForConfirmation(algodClient, tx.txId);

    res.json({
      vote: {
        status: "successful",
        ID: tx,
        from: from.addr,
        vote: choice
      }
    });
  } catch (e) {
    console.log("error", e);
    handleError(res, e);
  }
};

module.exports = {
  appVote
};
