import contract from 'truffle-contract'
import VotingContract from '@contracts/OwnerDecidesNoCap.json'

const Voting = {

    contract: null,
    instance: null,
    Vote: {
        UNKNOWN: 0,
        MET: 1, 
        NOT_MET: 2
    },

    init: function () {
        let self = this

        return new Promise(function (resolve, reject) {
            self.contract = contract(VotingContract)
            self.contract.setProvider(window.web3.currentProvider)
        
            self.instance = self.contract.at("0x528fa486b6f3af98cfc88c113a1857cfda9f9298")
        })
    },

    vote: function (address, vote) {
        let self = this
        return new Promise((resolve, reject) => {
            self.instance.vote.sendTransaction(address, vote, { from: window.web3.eth.coinbase }).then(function(hash) {
                resolve(hash)
            })
        })
    },

    getVoteStatus: function(address) {
        let self = this
        return new Promise((resolve, reject) => {
            self.instance.checkVote.call(address).then(function(result) {
                resolve(result)
            })
        })
    },

    getVotingAddress: function() {
        return this.instance.address
    }
}

export default Voting
