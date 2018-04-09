
<template>
    <div>
        <v-dialog max-width="800px" v-model="helpDialog">
      <v-card>
        <v-card-text>
          <p>
              Here, you can exchange Ether for WETH. WETH represents Ether but it is wrapped in a ERC20 token format, which lets
              you trade tokens for Ether in the exchange.
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>
      <v-btn
          slot="activator"
          color="pink"
          dark
          fab
          fixed
          top
          right
          @click="helpDialog = true"
        >
        <v-icon>help</v-icon>
      </v-btn>
        <p>Current WETH balance: {{ parseInt(balance)/10**18 }}</p>
        <v-text-field label="Amount" v-model="amount"></v-text-field>
        <v-btn @click="getWETH()">Get WETH</v-btn>
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
                balance: 0
            }
        },
        created: async function() {
            this.setBalance()
        },
        methods: {
            getWETH: async function() {
                const ethToConvert = ZeroEx.toBaseUnitAmount(new BigNumber(this.amount), 18)
                const convertEthTxHash = await zeroEx.etherToken.depositAsync(WETHaddress, ethToConvert, window.web3.eth.coinbase)
                showDialog = false
                await zeroEx.awaitTransactionMinedAsync(convertEthTxHash)
                this.setBalance()
            },

            setBalance: async function() {
                this.balance = await zeroEx.token.getBalanceAsync(WETHaddress, window.web3.eth.coinbase)
            }
        }
    };
</script>