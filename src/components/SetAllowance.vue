
<template>
    <div>
        <md-dialog class="dialog" :md-active.sync="showDialog">
            <md-dialog-title>Set Allowance</md-dialog-title>
            <md-field>
                <label for="Outcome Token">Outcome Token</label>
                <md-select v-model="outcomeAddress" name="Outcome token">
                    <md-option v-for="outcome in outcomes" :key="outcome.address" :value="outcome.address">{{ outcome.name }}</md-option>
                </md-select>
            </md-field>
            <md-button class="md-raised md-primary" @click="setAllowance()">Submit</md-button>
        </md-dialog>
        <md-button class="md-raised md-primary" @click="showDialog = true">Set Allowance</md-button>
    </div>
</template>

<script>
    import {
        ZeroEx
    } from '0x.js';
    var Addresses = require("../../contract_addresses.json")
    import {
        BigNumber
    } from '@0xproject/utils'
    import OutcomeToken from "@/js/outcometoken.js"
    import Voting from "@/js/voting.js"
    import * as Web3ProviderEngine from 'web3-provider-engine'
    import {
        InjectedWeb3Subprovider
    } from '@0xproject/subproviders'
    import * as RPCSubprovider from 'web3-provider-engine/subproviders/rpc'
    import {
        Web3Wrapper
    } from '@0xproject/web3-wrapper'
    
    var providerEngine = new Web3ProviderEngine();
    providerEngine.addProvider(new InjectedWeb3Subprovider(window.web3.currentProvider));
    providerEngine.addProvider(new RPCSubprovider({
        rpcUrl: 'https://ropsten.infura.io'
    }));
    providerEngine.start();
    var zeroEx = new ZeroEx(providerEngine, {
        networkId: 3
    });
    
    
    export default {
        data() {
            return {
                showDialog: false,
                outcomeAddress: undefined
            }
        },
    
        props: ["outcomes"],
    
        methods: {
            setAllowance: async function() {
                const setAllowTxHash = await zeroEx.token.setUnlimitedProxyAllowanceAsync(this.outcomeAddress, window.web3.eth.coinbase)
                this.showDialog = false
                await zeroEx.awaitTransactionMinedAsync(setAllowTxHash)
            },
        }
    }
</script>

<style>
    .md-menu-content {
        z-index: 99999 !important;
    }
    
    .dialog {
        padding: 30px;
    }
</style>

