pragma solidity ^0.4.17;

import '../node_modules/zeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import './OutcomeToken.sol';
import './IVotingMechanism.sol';

contract OwnerDecidesNoCap is IVotingMechanism {
    
    function checkVote(address _topic) view returns (Vote result) {
        return voteStatus[_topic];
    }
    
    function checkCap(ERC20 _payoutToken, address _topic, uint _value) view returns (bool allowed) {
        return true;
    }
    
    function vote(address _topic, Vote _vote) {
        OutcomeToken outcome = OutcomeToken(_topic);
        require(outcome.isOwner(msg.sender) == true);
        require(_vote != Vote.UNKNOWN);
        require(voteStatus[_topic] == Vote.UNKNOWN);
        voteStatus[_topic] = _vote;
        Voted(_topic, _vote);
    }
    
}