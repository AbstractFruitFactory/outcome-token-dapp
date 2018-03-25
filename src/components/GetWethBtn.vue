
<template>
    <div> 
        <md-dialog class="dialog" :md-active.sync="showDialog">
            <md-dialog-title>Get WETH</md-dialog-title>
            <md-field>
                <label>Amount</label>
                <md-input v-model="amount"></md-input>
            </md-field>
            <md-button class="md-raised md-primary" @click="getWETH()">Submit</md-button>
        </md-dialog>
        <md-button class="md-raised md-primary" v-on:click="showDialog = true">Get WETH</md-button>
    </div>
</template>

<script>
import { ZeroEx } from '0x.js';
var Addresses = require("../../contract_addresses.json")
import { BigNumber } from '@0xproject/utils'
import OutcomeToken from "@/js/outcometoken.js"
import Voting from "@/js/voting.js"
import * as Web3ProviderEngine from 'web3-provider-engine'
import { InjectedWeb3Subprovider } from '@0xproject/subproviders'
import * as RPCSubprovider from 'web3-provider-engine/subproviders/rpc'
import { Web3Wrapper } from '@0xproject/web3-wrapper'

var providerEngine = new Web3ProviderEngine();
providerEngine.addProvider(new InjectedWeb3Subprovider(window.web3.currentProvider));
providerEngine.addProvider(new RPCSubprovider({ rpcUrl: 'https://ropsten.infura.io' }));
providerEngine.start();
var zeroEx = new ZeroEx(providerEngine, { networkId: 3 });


export default {
    data() {
        return {
            showDialog: false,
            amount: undefined
        }
    },

    props: ["outcomes"],

    methods: {
        getWETH: async function() {
            const ethToConvert = ZeroEx.toBaseUnitAmount(new BigNumber(this.amount), 18)
            const convertEthTxHash = await zeroEx.etherToken.depositAsync(Addresses.WETH_ADDRESS, ethToConvert, window.web3.eth.coinbase)
            showDialog = false
            await zeroEx.awaitTransactionMinedAsync(convertEthTxHash)
        }
    }
};
</script>