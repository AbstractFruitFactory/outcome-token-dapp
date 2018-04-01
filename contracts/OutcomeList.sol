pragma solidity ^0.4.17;

contract OutcomeList {
    address[] public outcomes;

    function addOutcome(address outcome) {
        outcomes.push(outcome);
    }

    function getOutcomes() view returns(address[]) {
        return outcomes;
    }
}