import contract from 'truffle-contract'
import VotingContract from '@contracts/AnybodyDecidesNoCap.json'

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
        
            self.contract.deployed().then(instance => {
                self.instance = instance
                resolve()
            }).catch(err => {
                reject(err)
            })
        })
    },

    vote: function (address, vote) {
        let self = this
        return new Promise((resolve, reject) => {
            self.instance.vote(address, vote, { from: window.web3.eth.coinbase }).then(function() {
                resolve()
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
