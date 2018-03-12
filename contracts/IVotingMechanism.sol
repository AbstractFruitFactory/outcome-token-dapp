pragma solidity ^0.4.17;

import '../node_modules/zeppelin-solidity/contracts/token/ERC20/ERC20.sol';

contract IVotingMechanism {
    enum Vote { UNKNOWN, MET, NOT_MET }
    mapping (address => Vote) voteStatus;
    
    function checkVote(address _topic) constant returns (Vote result);
    function checkCap(ERC20 _payoutToken, address _topic, uint _value) constant returns (bool allowed);
    function vote(address _topic, Vote _vote);

    event Voted(address indexed _topic, Vote _vote);
}