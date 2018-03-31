import contract from 'truffle-contract'
import OutcomeContract from '@contracts/OutcomeToken.json'

const OutcomeToken = {
    
    contract: null,
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
            self.contract.at(address).back({ from: window.web3.eth.coinbase, value: web3.toWei(_value, "ether"), gas: 2300000}).then(function() {
                resolve()
            })
        })
    },

    isOwner: function(address) {
        let self = this
        return new Promise((resolve, reject) => {
            self.contract.at(address).isOwner.call({ from: window.web3.eth.coinbase }).then(function(result) {
                resolve(result)
            })
        })
    },

    redeemBackerToken: function(address, value) {
        let self = this
        
        return new Promise((resolve, reject) => {
            console.log("backer token")
            self.contract.at(address).redeemBackerTokens(web3.toWei(value, "ether"), { from: window.web3.eth.coinbase , gas: 2300000}).then(function() {
                resolve()
            })
        })
    },

    redeemRewardToken: function(address, value) {
        let self = this
        return new Promise((resolve, reject) => {
            self.contract.at(address).redeemRewardTokens(web3.toWei(value, "ether"), { from: window.web3.eth.coinbase, gas: 2300000 }).then(function() {
                resolve()
            })
        })
    },

    transferTokens: function(address, recipient, value) {
        let self = this
        return new Promise((resolve, reject) => {
            self.contract.at(address).transfer(recipient, web3.toWei(value, "ether"), { from: window.web3.eth.coinbase, gas: 2300000 }).then(function() {
                resolve()
            })
        })
    },

    getName: function(address) {
        let self = this
        return new Promise((resolve, reject) => {
            self.contract.at(address).getName().then(function(result) {
                resolve(result)
            }).catch(function() {
                resolve(address)
            })
        })
    },

    deployNew: function (name, voting) {
        let self = this
    
        return new Promise((resolve, reject) => {
            self.contract.new(name, voting, { from: window.web3.eth.coinbase, gas: 2300000, gasPrice: 100000000000 }).then(function(instance) {
                resolve(instance.address)
            })
        })
    }
}

export default OutcomeToken
