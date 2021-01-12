const algoSdk = require("algosdk");
const algodClient = require("../../../services/algorand/client");
const algodIndexer = require("../../../services/algorand/indexer");
const { getCreatedAsset } = require("../../../utils/assetsHelpers");
const { waitForConfirmation, signAndSendTx } = require("../../../utils/index");
const handleError = require("../../../utils/errorHandling");

const getAssetsForSingleAccount = async (req, res) => {
  try {
    let address = req.params.id;
    let accountInfo = await algodIndexer.lookupAccountByID(address).do();
    let assets = accountInfo.account.assets;

    res.json({ assets });
  } catch (e) {
    console.log("error", e);
    handleError(res, e);
  }
};

const createAsset = async (req, res) => {
  try {
    const { passphrase, amount, unit_name, asset_name } = req.body;
    var account = algoSdk.mnemonicToSecretKey(passphrase);
    let params = await algodClient.getTransactionParams().do();
    params.fee = 1000;
    params.flatFee = true;

    // asset information
    let addr = account.addr;
    let defaultFrozen = false;
    let decimals = 0;
    let totalIssuance = parseInt(amount);
    let unitName = unit_name;
    let assetName = asset_name;

    console.log("totalInsurance", typeof totalIssuance);
    // accounts
    let manager = account.addr;
    let reserve = account.addr;
    let freeze = account.addr;
    let clawback = account.addr;

    // transaction
    let txn = algoSdk.makeAssetCreateTxnWithSuggestedParams(
      addr,
      undefined,
      totalIssuance,
      decimals,
      defaultFrozen,
      manager,
      reserve,
      freeze,
      clawback,
      unitName,
      assetName,
      undefined,
      undefined,
      params
    );

    let rawSignedTnx = txn.signTxn(account.sk);

    let tx = await algodClient.sendRawTransaction(rawSignedTnx).do();
    let assetID = null;

    await waitForConfirmation(algodClient, tx.txId);

    let ptx = await algodClient.pendingTransactionInformation(tx.txId).do();
    assetID = ptx["asset-index"];

    const createdAsset = await getCreatedAsset(algodClient, manager, assetID);

    res.json({ createdAsset });
  } catch (e) {
    handleError(res, e);
  }
};

const assetOptIn = async (req, res) => {
  try {
    const { assetID, sender } = req.body;
    let from = await algoSdk.mnemonicToSecretKey(sender);
    let params = await algodClient.getTransactionParams().do();

    // signing and sending "txn" allows sender to begin accepting asset specified by creator and index
    let txn = algoSdk.makeAssetTransferTxnWithSuggestedParams(
      from.addr,
      from.addr,
      undefined,
      undefined,
      0,
      undefined,
      assetID,
      params
    );

    let tokenOptIn = await signAndSendTx(algodClient, from, txn);

    // wait for transaction to be confirmed
    let confirmedOptIn = await waitForConfirmation(
      algodClient,
      tokenOptIn.txId
    );

    res.json({
      transaction: {
        status: "successful",
        ID: tokenOptIn.txId,
        type: confirmedOptIn.txn.txn.type
      }
    });
  } catch (e) {
    console.log("error", e);
    handleError(res, e);
  }
};

const sendAsset = async (req, res) => {
  try {
    const { assetID, amount, sender, recipient } = req.body;
    let from = await algoSdk.mnemonicToSecretKey(sender);
    let params = await algodClient.getTransactionParams().do();

    let votingTokenTransfer = algoSdk.makeAssetTransferTxnWithSuggestedParams(
      from.addr,
      recipient,
      undefined,
      undefined,
      amount || 1,
      undefined,
      assetID,
      params
    );

    let rawSignedAssetTxn = votingTokenTransfer.signTxn(from.sk);
    let assetTx = await algodClient.sendRawTransaction(rawSignedAssetTxn).do();

    let confirmedAssetTxn = await waitForConfirmation(
      algodClient,
      assetTx.txId
    );

    res.json({
      transaction: {
        status: "successful",
        ID: assetTx.txId,
        from: from.addr,
        to: recipient,
        type: confirmedAssetTxn.txn.txn.type
      }
    });
  } catch (e) {
    console.log("error", e);
    handleError(res, e);
  }
};

const getAsset = async (req, res) => {
  try {
    let { id } = req.params;

    let response = await algodIndexer.searchForAssets().index(id).do();

    res.json({ response });
  } catch (e) {
    console.log("error", e);
    handleError(res, e);
  }
};

const getAssetBalances = async (req, res) => {
  try {
    let { id } = req.params;
    let { currencyGreater } = req.body;

    let response = await algodIndexer
      .lookupAssetBalances(id)
      .currencyGreaterThan(currencyGreater)
      .do();

    res.json({ response });
  } catch (e) {
    console.log("error", e);
    handleError(res, e);
  }
};

module.exports = {
  getAssetsForSingleAccount,
  createAsset,
  sendAsset,
  assetOptIn,
  getAsset,
  getAssetBalances
};
