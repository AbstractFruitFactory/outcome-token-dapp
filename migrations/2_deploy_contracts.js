var Users = artifacts.require("./Users.sol");
var Voting = artifacts.require("./AnybodyDecidesNoCap.sol");
var OutcomeToken = artifacts.require("./OutcomeToken.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Users);
  deployer.deploy(Voting);
};
