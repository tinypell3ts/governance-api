module.exports = waitForConfirmation = async function (algodclient, txId) {
  let status = await algodclient.status().do();
  let lastRound = status["last-round"];
  while (true) {
    const pendingInfo = await algodclient
      .pendingTransactionInformation(txId)
      .do();
    if (
      pendingInfo["confirmed-round"] !== null &&
      pendingInfo["confirmed-round"] > 0
    ) {
      //Got the completed Transaction
      console.log(
        "Transaction " +
          txId +
          " confirmed in round " +
          pendingInfo["confirmed-round"]
      );
      return pendingInfo;
    }
    lastRound++;
    await algodclient.statusAfterBlock(lastRound).do();
  }
};
