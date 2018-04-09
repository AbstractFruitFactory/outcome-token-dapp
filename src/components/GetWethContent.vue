
<template>
    <div>
        <v-snackbar :timeout="6000" top v-model="snackbar">
            You don't have enough Ether!
            <v-btn flat color="pink" @click.native="snackbar = false">Close</v-btn>
        </v-snackbar>
        <v-dialog max-width="800px" v-model="helpDialog">
            <v-card>
                <v-card-text>
                    <p>
                        Here, you can exchange Ether for WETH. WETH represents Ether but it is wrapped in a ERC20 token format, which lets you trade tokens for Ether in the exchange.
                    </p>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog max-width="500px" v-model="showDialog">
            <v-card>
                <v-card-text>
                    <v-text-field label="Amount" v-model="amount"></v-text-field>
                    <v-btn @click="getWETH()">Submit</v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-btn slot="activator" color="pink" dark fab fixed top right @click="helpDialog = true">
            <v-icon>help</v-icon>
        </v-btn>
        <p>Current WETH balance: {{ parseInt(balance)/10**18 }}</p>
        <v-btn @click="showDialog = true">Get WETH</v-btn>
        <v-layout class="layout">
            <p>Enabled for trading: </p>
            <v-switch class="switch" v-model="enabled" @click="setEnabled(enabled)"></v-switch>
        </v-layout>
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
    var WETHaddress = zeroEx.etherToken.getContractAddressIfExists();
    
    
    export default {
        data() {
            return {
                showDialog: false,
                amount: undefined,
                helpDialog: false,
                balance: 0,
                enabled: undefined,
                snackbar: false,
                errorMsg: undefined
            }
        },
        created: async function() {
            this.setBalance()
            let allowance = await zeroEx.token.getProxyAllowanceAsync(WETHaddress, window.web3.eth.coinbase)
            this.enabled = (allowance > 0) ? true : false;
        },
        methods: {
            getWETH: async function() {
                var self = this
                const ethToConvert = ZeroEx.toBaseUnitAmount(new BigNumber(this.amount), 18)
                const convertEthTxHash = zeroEx.etherToken.depositAsync(WETHaddress, ethToConvert, window.web3.eth.coinbase).then(async function() {
                    self.showDialog = false
                    await zeroEx.awaitTransactionMinedAsync(convertEthTxHash)
                    this.setBalance()
                }).catch(function(err) {
                    if(err.message == "INSUFFICIENT_ETH_BALANCE_FOR_DEPOSIT") {
                        self.snackbar = true
                    }
                })
            },
    
            setBalance: async function() {
                this.balance = await zeroEx.token.getBalanceAsync(WETHaddress, window.web3.eth.coinbase)
            },
    
            setEnabled: function(enabled) {
                if (!enabled) {
                    const setAllowTxHash = zeroEx.token.setUnlimitedProxyAllowanceAsync(
                        WETHaddress,
                        window.web3.eth.coinbase
                    );
                } else {
                    const setAllowTxHash = zeroEx.token.setProxyAllowanceAsync(
                        WETHaddress,
                        window.web3.eth.coinbase,
                        new BigNumber(0)
                    );
                }
            },
    
        }
    };
</script>

<style>
    p {
        padding-right: 10px;
    }
    
    .layout {
        padding-top: 30px;
    }
</style>
