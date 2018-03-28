
<template>
    <div>
        <md-dialog class="dialog" :md-active.sync="showDialog">
            <md-dialog-title>Make Order</md-dialog-title>
    
            <h3>Maker outcome token:</h3>
            <div class="md-layout-item">
                <md-field>
                    <label for="Outcome Token">Outcome Token</label>
                    <md-select v-model="makerTokenAddress" name="Outcome token">
                        <div v-for="outcome in outcomes" :key="outcome.address">
                            <md-option :value="outcome.address">{{ outcome.name }}</md-option>
                        </div>
                    </md-select>
                </md-field>
            </div>
            <md-field>
                <label>Amount</label>
                <md-input v-model="makerTokenAmount"></md-input>
            </md-field>
            <h3>Taker outcome token:</h3>
            <div class="md-layout-item">
                <md-field>
                    <label for="Outcome Token">Outcome Token</label>
                    <md-select v-model="takerTokenAddress" name="Outcome token">
                        <div v-for="outcome in outcomes" :key="outcome.address">
                            <md-option :value="outcome.address">{{ outcome.name }}</md-option>
                        </div>
                    </md-select>
                </md-field>
            </div>
            <md-field>
                <label>Amount</label>
                <md-input v-model="takerTokenAmount"></md-input>
            </md-field>
    
    
            <md-button class="md-raised md-primary" @click="makeOrder()">Submit</md-button>
        </md-dialog>
        <md-button class="md-raised md-primary" @click="showDialog = true">Make Order</md-button>
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
    var rp = require('request-promise');
    
    var providerEngine = new Web3ProviderEngine();
    providerEngine.addProvider(new InjectedWeb3Subprovider(window.web3.currentProvider));
    providerEngine.addProvider(new RPCSubprovider({
        rpcUrl: 'https://ropsten.infura.io'
    }));
    providerEngine.start();
    var zeroEx = new ZeroEx(providerEngine, {
        networkId: 3
    });
    var openrelayBaseURL = "https://api.openrelay.xyz";
    
    export default {
        data() {
            return {
                makerTokenAddress: undefined,
                takerTokenAddress: undefined,
                makerTokenAmount: undefined,
                takerTokenAmount: undefined,
                signedOrder: undefined,
                showDialog: false
            }
        },
    
        created: function() {
            this.exchangeAddress = Addresses.EXCHANGE_ADDRESS
        },
    
        props: ["outcomes"],
    
        methods: {
    
            makeOrder: async function() {
                var self = this
                var makerAddress = window.web3.eth.coinbase
                const order = {
                    maker: makerAddress,
                    taker: ZeroEx.NULL_ADDRESS,
                    makerTokenAddress: this.makerTokenAddress,
                    takerTokenAddress: this.takerTokenAddress,
                    exchangeContractAddress: Addresses.EXCHANGE_ADDRESS,
                    salt: ZeroEx.generatePseudoRandomSalt(),
                    makerFee: new BigNumber(0),
                    takerFee: new BigNumber(0),
                    makerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(this.makerTokenAmount), 18),
                    takerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(this.takerTokenAmount), 18),
                    expirationUnixTimestampSec: new BigNumber(Date.now() + 3600000), // Valid for up to an hour
                }
                var feePromise = rp({
                    method: 'POST',
                    uri: openrelayBaseURL + "/v0/fees",
                    body: order,
                    json: true,
                }).then(async function(feeResponse) {
                    // Convert the makerFee and takerFee into BigNumbers
                    order.makerFee = new BigNumber(feeResponse.makerFee);
                    order.takerFee = new BigNumber(feeResponse.takerFee);
                    // The fee API tells us what taker to specify
                    order.taker = feeResponse.takerToSpecify;
                    // The fee API tells us what feeRecipient to specify
                    order.feeRecipient = feeResponse.feeRecipient;
                    const orderHash = ZeroEx.getOrderHashHex(order)
                    const shouldAddPersonalMessagePrefix = true
    
                    const ecSignature = await zeroEx.signOrderHashAsync(orderHash, makerAddress, shouldAddPersonalMessagePrefix)
    
                    // Append signature to order
                    var signedOrder = {
                        ...order,
                        ecSignature,
                    }
                    await zeroEx.exchange.validateOrderFillableOrThrowAsync(signedOrder)
                    rp({
                        method: 'POST',
                        uri: openrelayBaseURL + "/v0/order",
                        body: signedOrder,
                        json: true,
                    })
                    self.showDialog = false
                    self.$emit('orderSubmitted')
                })
            }
        }
    };
</script>

<style>
    .md-menu-content {
        z-index: 99999 !important;
    }
    
    .dialog {
        padding: 30px;
    }
</style>
