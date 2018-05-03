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
        let currentAccount
        return new Promise((resolve, reject) => {
            window.web3.eth.getAccounts((err, accounts) => {
                currentAccount = accounts[0]

                self.contract.at(address).back.sendTransaction({ from: currentAccount, value: web3.toWei(_value, "ether"), gas: 2300000 }).then(function (hash) {
                    resolve(hash)
                })
            })
        })
    },

    isOwner: function (address) {
        let self = this
        let currentAccount
        return new Promise((resolve, reject) => {
            window.web3.eth.getAccounts((err, accounts) => {
                currentAccount = accounts[0]

                self.contract.at(address).isOwner.call(currentAccount, { from: currentAccount }).then(function (result) {
                    console.log(result)
                    resolve(result)
                })
            })
        })
    },

    redeemBackerToken: function (address, value) {
        let self = this
        let currentAccount
        return new Promise((resolve, reject) => {
            window.web3.eth.getAccounts((err, accounts) => {
                currentAccount = accounts[0]

                console.log("backer token")
                self.contract.at(address).redeemBackerTokens.sendTransaction(web3.toWei(value, "ether"), { from: currentAccount, gas: 2300000 }).then(function (hash) {
                    resolve(hash)
                })
            })
        })
    },

    redeemRewardToken: function (address, value) {
        let self = this
        let currentAccount
        return new Promise((resolve, reject) => {
            window.web3.eth.getAccounts((err, accounts) => {
                currentAccount = accounts[0]

                self.contract.at(address).redeemRewardTokens(web3.toWei(value, "ether"), { from: currentAccount, gas: 2300000 }).then(function () {
                    resolve()
                })
            })
        })
    },

    transfer: function (address, recipient, value) {
        let self = this
        let currentAccount
        return new Promise((resolve, reject) => {
            window.web3.eth.getAccounts((err, accounts) => {
                currentAccount = accounts[0]

                self.contract.at(address).transfer(recipient, web3.toWei(value, "ether"), { from: currentAccount, gas: 2300000 }).then(function () {
                    resolve()
                })
            })
        })
    },

    getName: function (address) {
        let self = this
        let currentAccount
        return new Promise((resolve, reject) => {
            window.web3.eth.getAccounts((err, accounts) => {
                currentAccount = accounts[0]

                self.contract.at(address).getName({ from: currentAccount }).then(function (name) {
                    resolve(name)
                }).catch(function () {
                    resolve(address)
                })
            })
        })
    },

    getAmount: function (address) {
        let self = this
        let currentAccount
        return new Promise((resolve, reject) => {
            window.web3.eth.getAccounts((err, accounts) => {
                currentAccount = accounts[0]

                self.contract.at(address).balanceOf(currentAccount).then(function (amount) {
                    resolve(amount)
                })
            })
        })
    },

    deployNew: function (name, voting) {
        let self = this
        let currentAccount
        window.web3.eth.getAccounts((err, accounts) => {
            currentAccount = accounts[0]
            let contract = window.web3.eth.contract(OutcomeContract.abi)
            return new Promise((resolve, reject) => {
                contract.new(name, voting, "0x1e528859d160b4467a0963a2422037fa19087d02", { from: currentAccount, data: OutcomeContract.bytecode, gas: 4400000, gasPrice: 100000000000 }, function (err, instance) {
                    if (!instance.address) {
                        resolve(instance.transactionHash)
                    }
                })
            })
        })
    },

    listenToTransferEvent: function (address) {
        let self = this
        let currentAccount
        return new Promise((resolve, reject) => {
            window.web3.eth.getAccounts((err, accounts) => {
                currentAccount = accounts[0]
                let event = self.contract.at(address).Transfer({ from: currentAccount })
                event.watch(function (error, result) {
                    if (!error)
                        resolve({
                            to: result.args.to,
                            value: result.args.value
                        })
                });
            })
        })
    },

    getPastTransferEvents: function (address) {
        let self = this
        let contract = new window.web3.eth.Contract(OutcomeContract.abi)
        contract.options.address = address
        let currentAccount
        return new Promise((reject, resolve) => {
            window.web3.eth.getAccounts((err, accounts) => {
                currentAccount = accounts[0]
                contract.getPastEvents('Transfer', {
                    filter: { from: currentAccount },
                    fromBlock: 0,
                    toBlock: 'latest',
                }, function (error, events) {
                    let eventResults = events.map((event) => {
                        {
                            event.returnValues.to
                            event.returnValues.value
                        }
                    })
                    resolve(eventResults)
                })
            })
        })
    }
}

export default OutcomeToken
