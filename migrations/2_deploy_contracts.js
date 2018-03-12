var Users = artifacts.require("./Users.sol");
var Voting = artifacts.require("./AnybodyDecidesNoCap.sol");
var OutcomeToken = artifacts.require("./OutcomeToken.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Users);
  deployer.deploy(Voting).then(function() {
    return deployer.deploy(OutcomeToken, 'Outcome', Voting.address, { from: accounts[0], gas: 4612388 });
  });

};
