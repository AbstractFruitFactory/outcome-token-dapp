import contract from 'truffle-contract'
import OutcomeContract from '@contracts/OutcomeToken.json'
import VotingContract from '@contracts/AnybodyDecidesNoCap.json'

const OutcomeToken = {

    contract: null,

    instance: null,

    init: function () {
        let self = this

        return new Promise(function (resolve, reject) {
            self.contract = contract(OutcomeContract)
            self.contract.setProvider(window.web3.currentProvider)

            self.contract.deployed().then(instance => {
                self.instance = instance
                resolve()
            }).catch(err => {
                reject(err)
            })
        })
    },

    back: function (address, _value) {
        let self = this
        return new Promise((resolve, reject) => {
            self.contract.at(address).back({ from: window.web3.eth.coinbase, value: web3.toWei(_value, "ether") })
        })
    },

    deployNew: function(name) {
        let self = this

        return new Promise((resolve, reject) => {
            self.instance.getVotingAddress.call().then(async function(address) {
                let contract = await self.contract.new(name, address, { from: window.web3.eth.coinbase, gas: 2300000 })
                resolve(contract.address);
            })
        })
    }
}

export default OutcomeToken
