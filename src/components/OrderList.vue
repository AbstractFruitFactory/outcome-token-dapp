
<template>
    <div>
        <md-dialog class="dialog" :md-active.sync="showDialog">
            <md-dialog-title>Fill Order</md-dialog-title>
            <md-field>
                <label>Amount</label>
                <md-input v-model="fillAmount"></md-input>
            </md-field>
            <md-button class="md-raised md-primary" @click="takeOrder()">Submit</md-button>
        </md-dialog>

        <md-list v-for="signedOrder in signedOrders" :key="signedOrder.id">
            <md-list-item @click="orderDialog(signedOrder)">{{ signedOrder.makerTokenAmount/10**18 }} {{ signedOrder.makerTokenAddress }} for {{ signedOrder.takerTokenAmount/10**18 }} {{ signedOrder.takerTokenAddress }}</md-list-item>
        </md-list>
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
            signedOrders: [],
            fillAmount: undefined,
            showDialog: false,
            currentOrder: undefined
        }
    },

    methods: {
       takeOrder: async function() {
            var takerAddress = window.web3.eth.coinbase
            var shouldThrowOnInsufficientBalanceOrAllowance = true
            const fillTakerTokenAmount = ZeroEx.toBaseUnitAmount(new BigNumber(this.fillAmount), 18)
            const txHash = await zeroEx.exchange.fillOrderAsync(
                this.currentOrder,
                fillTakerTokenAmount,
                shouldThrowOnInsufficientBalanceOrAllowance,
                takerAddress,
            )
            const txReceipt = await zeroEx.awaitTransactionMinedAsync(txHash)
            console.log('FillOrder transaction receipt: ', txReceipt)
        },

        addSignedOrder: function(signedOrder) {
            this.signedOrders.push(signedOrder)
        },

        orderDialog: function(signedOrder) {
            this.currentOrder = signedOrder
            this.showDialog = true
        }
    }
};
</script>