var HDWalletProvider = require("truffle-hdwallet-provider");
var fs = require('fs');

var mnemonic  = fs.readFileSync('seed_words.txt', 'utf8');

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 9545,
      gas: 5000000,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/1ZabHKvRw6HJ1ehv5rNp")
      },
      network_id: '3',
      gas: 4612388.
    },
  }
};
