import contract from 'truffle-contract'
import OutcomeContract from '@contracts/OutcomeToken.json'

const OutcomeToken = {

    contract: null,
    instance: null,
    init: function () {
        let self = this
        return new Promise(function (resolve, reject) {
            self.contract = contract(OutcomeContract)
            self.contract.setProvider(window.web3.currentProvider)
        })
    },
    
    back: function (address, _value) {
        let self = this
        return new Promise((resolve, reject) => {
            self.contract.at(address).back({ from: window.web3.eth.coinbase, value: web3.toWei(_value, "ether") })
        })
    },

    deployNew: function (name, voting) {
        let self = this

        return new Promise((resolve, reject) => {
            self.contract.new(name, voting, { from: window.web3.eth.coinbase, gas: 2300000 }).then(function(address) {
                resolve(address);
            })
            
        })
    }
}

export default OutcomeToken
