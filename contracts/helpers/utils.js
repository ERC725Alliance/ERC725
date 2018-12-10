const truffleContract = require('truffle-contract');
const compile = require('truffle-compile');

function getEncodedCall(web3, instance, method, params = []) {
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

function compileCode(source, options, coinbase) {
  return new Promise(function (resolve, reject) {
    compile(source, options, function (err, val) {
      if (err) {
        reject(err)
      }
      const Forwarder = truffleContract(val.Forwarder);
      Forwarder.setProvider(web3.currentProvider);
      Forwarder.defaults({
        from: coinbase,
        gas: 6721975
      })
      resolve(Forwarder)
    });
  });
}

module.exports = {
  getEncodedCall,
  getCoinbase,
  compileCode
};
