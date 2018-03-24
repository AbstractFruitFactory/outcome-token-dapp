
<template>
    <div>
        <md-button v-on:click="makeOrder">Make Order</md-button>
        <md-button v-on:click="takeOrder">Take Order</md-button>
        <md-button v-on:click="setAllowance">Set Allowance</md-button>
        <md-field>
          <md-input v-model="wethAmount"></md-input>
        </md-field>
        <md-button v-on:click="convertEthToWeth">Get WETH</md-button>
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
import * as RPCSubprovider from 'web3-provider-engine/subproviders/rpc';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
var providerEngine = new Web3ProviderEngine();

providerEngine.addProvider(new InjectedWeb3Subprovider(window.web3.currentProvider));

providerEngine.addProvider(new RPCSubprovider({ rpcUrl: 'http://localhost:9545' }));
providerEngine.start();
var zeroEx = new ZeroEx(providerEngine, { networkId: 3 });


export default {
    data() {
        return {
            makerTokenAddress: undefined,
            takerTokenAddress: undefined,
            exchangeAddress: undefined,
            decimals: undefined,
            zeroEx: undefined,
            signedOrder: undefined,
            order: undefined,
            wethAmount: undefined
        }
    },

    created: function() {
        // Optional, use with 0x.js
        this.decimals = 18
        this.makerTokenAddress = Addresses.WETH_ADDRESS
        this.takerTokenAddress = Addresses.WETH_ADDRESS
        this.exchangeAddress = Addresses.EXCHANGE_ADDRESS
        this.order = {
            maker: undefined,
            taker: ZeroEx.NULL_ADDRESS,
            feeRecipient: ZeroEx.NULL_ADDRESS,
            makerTokenAddress: Addresses.WETH_ADDRESS,
            takerTokenAddress: Addresses.WETH_ADDRESS,
            exchangeContractAddress: Addresses.EXCHANGE_ADDRESS,
            salt: ZeroEx.generatePseudoRandomSalt(),
            makerFee: new BigNumber(0),
            takerFee: new BigNumber(0),
            makerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(0.2), 18), // Base 18 decimals
            takerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(0.3), 18), // Base 18 decimals
            expirationUnixTimestampSec: new BigNumber(Date.now() + 3600000), // Valid for up to an hour
        }
    },

    methods: {

        setAllowance: async function() {
            const zeroEx = new ZeroEx(window.web3.currentProvider, { networkId: 3 });
            const setAllowTxHash = await zeroEx.token.setUnlimitedProxyAllowanceAsync(this.makerTokenAddress, window.web3.eth.coinbase)
            await zeroEx.awaitTransactionMinedAsync(setAllowTxHash)
        },

        makeOrder: async function() {
            
            var makerAddress = window.web3.eth.coinbase
            const order = {
                maker: makerAddress,
                taker: ZeroEx.NULL_ADDRESS,
                feeRecipient: ZeroEx.NULL_ADDRESS,
                makerTokenAddress: Addresses.ZRX_ADDRESS,
                takerTokenAddress: Addresses.WETH_ADDRESS,
                exchangeContractAddress: Addresses.EXCHANGE_ADDRESS,
                salt: ZeroEx.generatePseudoRandomSalt(),
                makerFee: new BigNumber(0),
                takerFee: new BigNumber(0),
                makerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(0.2), 18), // Base 18 decimals
                takerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(0.3), 18), // Base 18 decimals
                expirationUnixTimestampSec: new BigNumber(Date.now() + 3600000), // Valid for up to an hour
            }
            console.log(order)
            const orderHash = ZeroEx.getOrderHashHex(order)
            const shouldAddPersonalMessagePrefix = false
            
            const ecSignature = await zeroEx.signOrderHashAsync(orderHash, makerAddress, shouldAddPersonalMessagePrefix)
        
            // Append signature to order
            this.signedOrder = {
                ...order,
                ecSignature,
            }
            await zeroEx.exchange.validateOrderFillableOrThrowAsync(signedOrder);
        },

        takeOrder: async function(amount) {
            const zeroEx = new ZeroEx(window.web3.currentProvider, { networkId: 3 });
            var takerAddress = window.web3.eth.coinbase
            const setAllowTxHash = await zeroEx.token.setUnlimitedProxyAllowanceAsync(this.takerTokenAddress, takerAddress)
            await zeroEx.awaitTransactionMinedAsync(setAllowTxHash)
            const shouldThrowOnInsufficientBalanceOrAllowance = true
            const fillTakerTokenAmount = ZeroEx.toBaseUnitAmount(amount, this.decimals)
            const txHash = await zeroEx.exchange.fillOrderAsync(
                this.signedOrder,
                fillTakerTokenAmount,
                shouldThrowOnInsufficientBalanceOrAllowance,
                takerAddress,
            )
            const txReceipt = await zeroEx.awaitTransactionMinedAsync(txHash)
            console.log('FillOrder transaction receipt: ', txReceipt)
        },

        convertEthToWeth: async function() {
            const zeroEx = new ZeroEx(window.web3.currentProvider, { networkId: 3 });
            const ethToConvert = ZeroEx.toBaseUnitAmount(new BigNumber(this.wethAmount), this.decimals)
            const convertEthTxHash = await zeroEx.etherToken.depositAsync(Addresses.WETH_ADDRESS, ethToConvert, window.web3.eth.coinbase)
            await zeroEx.awaitTransactionMinedAsync(convertEthTxHash)
        },

        verifyOrder: async function() {
            result = await zeroEx.exchange.validateOrderFillableOrThrowAsync(this.signedOrder)
        }
    }
};
</script>