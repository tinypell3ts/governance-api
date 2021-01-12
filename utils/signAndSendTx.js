module.exports = signAndSendTx = async function (algodClient, sender, txn) {
  console.log("Signing and `Sending Transaction");
  let rawSignedTxn = txn.signTxn(sender.sk);
  return await algodClient.sendRawTransaction(rawSignedTxn).do();
};
