var Voting = artifacts.require("./OwnerDecidesNoCap.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Voting);
};