import contract from 'truffle-contract'
import OutcomeListContract from '@contracts/OutcomeList.json'

const OutcomeList = {
    
    contract: null,
    init: function () {
        let self = this
        return new Promise(function (resolve, reject) {
            self.contract = contract(OutcomeListContract)
            self.contract.setProvider(window.web3.currentProvider)
            self.instance = self.contract.at("0x1e528859d160b4467a0963a2422037fa19087d02")
            resolve()
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
