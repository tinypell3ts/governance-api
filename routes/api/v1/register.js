const algoSdk = require("algosdk");
const algodClient = require("../../../services/algorand/client");
const { waitForConfirmation } = require("../../../utils/index");
const handleError = require("../../../utils/errorHandling");

const register = async (req, res) => {
  try {
    const { passphrase, appID, assetID, amount } = req.body;

    let voter = await algoSdk.mnemonicToSecretKey(passphrase);
    let central = await algoSdk.mnemonicToSecretKey(
      process.env.CREATOR_PASSPHRASE
    );
    let params = await algodClient.getTransactionParams().do();

    // Transaction 1 - Send Voter Algos
    let transaction1 = algoSdk.makePaymentTxnWithSuggestedParams(
      central.addr,
      voter.addr,
      amount,
      undefined,
      undefined,
      params
    );
    // Transaction 2 - Optin to Asset
    let transaction2 = algoSdk.makeAssetTransferTxnWithSuggestedParams(
      voter.addr,
      voter.addr,
      undefined,
      undefined,
      0,
      undefined,
      assetID,
      params
    );

    // Transaction 3 - Register
    let register = "register";
    let appArgs = [];
    appArgs.push(new Uint8Array(Buffer.from(register)));

    let transaction3 = algoSdk.makeApplicationOptInTxn(
      voter.addr,
      params,
      appID,
      appArgs
    );

    // Transaction 4 - Send Voting token to Voter
    let transaction4 = algoSdk.makeAssetTransferTxnWithSuggestedParams(
      central.addr,
      voter.addr,
      undefined,
      undefined,
      1,
      undefined,
      assetID,
      params
    );

    // Group Transactions
    let txns = [transaction1, transaction2, transaction3, transaction4];
    let txgroup = algoSdk.assignGroupID(txns);

    let signedTxn1 = transaction1.signTxn(central.sk);
    let signedTxn2 = transaction2.signTxn(voter.sk);
    let signedTxn3 = transaction3.signTxn(voter.sk);
    let signedTxn4 = transaction4.signTxn(central.sk);

    let signed = [];
    signed.push(signedTxn1);
    signed.push(signedTxn2);
    signed.push(signedTxn3);
    signed.push(signedTxn4);

    let tx = await algodClient.sendRawTransaction(signed).do();

    await waitForConfirmation(algodClient, tx.txId);

    res.json({
      register: {
        status: "successful",
        ID: tx.txId,
        appID: appID,
        from: central.addr
      }
    });
  } catch (e) {
    console.log("error", e);
    handleError(res, e);
  }
};

module.exports = {
  register
};
