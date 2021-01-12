const getCreatedAsset = async function (algodclient, account, assetid) {
  // note: if you have an indexer instance available it is easier to just use this
  //     let accountInfo = await indexerClient.searchAccounts()
  //    .assetID(assetIndex).do();
  // and in the loop below use this to extract the asset for a particular account
  // accountInfo['accounts'][idx][account]);
  let accountInfo = await algodclient.accountInformation(account).do();
  for (idx = 0; idx < accountInfo["created-assets"].length; idx++) {
    let scrutinizedAsset = accountInfo["created-assets"][idx];
    if (scrutinizedAsset["index"] == assetid) {
      return (createdAsset = {
        assetID: scrutinizedAsset["index"],
        ...scrutinizedAsset["params"]
      });
    }
  }
};

module.exports = {
  getCreatedAsset
};
