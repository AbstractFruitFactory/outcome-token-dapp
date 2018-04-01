import contract from 'truffle-contract'
import OutcomeListContract from '@contracts/OutcomeList.json'

const OutcomeList = {
    
    contract: null,
    init: function () {
        let self = this
        return new Promise(function (resolve, reject) {
            self.contract = contract(OutcomeListContract)
            self.contract.setProvider(window.web3.currentProvider)
        
            self.contract.deployed().then(instance => {
                self.instance = instance
                resolve()
            }).catch(err => {
                reject(err)
            })
        })
    },

    getOutcomeAddresses: function() {
        let self = this
        return new Promise(function(resolve, reject) {
            self.instance.getOutcomes().then(function(addresses) {
                resolve(addresses)
            })
        })
    }
}

export default OutcomeList
