var Voting = artifacts.require("./OwnerDecidesNoCap.sol");
var OutcomeList = artifacts.require("./OutcomeList.sol")

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Voting);
  deployer.deploy(OutcomeList);
};