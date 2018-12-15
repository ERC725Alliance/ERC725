function getEncodedCall(instance, method, params = []) {
  const contract = new web3.eth.Contract(instance.abi)
  return contract.methods[method](...params).encodeABI()
}

async function getCoinbase() {
  return new Promise(function (resolve, reject) {
    web3.eth.getCoinbase(function (err, res) {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
}

module.exports = {
  getEncodedCall,
  getCoinbase
};
