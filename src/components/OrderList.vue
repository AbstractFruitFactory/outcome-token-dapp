
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

        <MakeOrderBtn @orderSubmitted="updateList()" :outcomeAddresses="outcomeAddresses" :outcomeNames="outcomeNames"></MakeOrderBtn>

        <md-field id="orderList">
           <label>Pick an order</label>
            <md-list @md-selected="orderDialog">
                <md-list-item v-for="(signedOrder,i) in signedOrders" :key="signedOrder.id" :value="signedOrder" @click="showDialog = true">
                    <div v-if="typeof asyncDataHolder[i] !== 'undefined'">
                      {{signedOrder.makerTokenAmount/10**18}} {{asyncDataHolder[i].makerTokenName}} for {{signedOrder.takerTokenAmount/10**18}} {{asyncDataHolder[i].takerTokenName}}
                    </div>
                </md-list-item>
            </md-list>
        </md-field>

        <v-data-table
        :headers="headers"
        :items="items"
        :loading="isLoading"
        hide-actions
        class="elevation-1"
        >
          
        </v-data-table>
    </div>
</template>

<script>
import { ZeroEx } from "0x.js";
var Addresses = require("../../contract_addresses.json");
import { BigNumber } from "@0xproject/utils";
import OutcomeToken from "@/js/outcometoken.js";
import Voting from "@/js/voting.js";
import * as Web3ProviderEngine from "web3-provider-engine";
import { InjectedWeb3Subprovider } from "@0xproject/subproviders";
import * as RPCSubprovider from "web3-provider-engine/subproviders/rpc";
import { Web3Wrapper } from "@0xproject/web3-wrapper";
import MakeOrderBtn from "@/components/MakeOrderBtn.vue";
var rp = require("request-promise");

var providerEngine = new Web3ProviderEngine();
providerEngine.addProvider(
  new InjectedWeb3Subprovider(window.web3.currentProvider)
);
providerEngine.addProvider(
  new RPCSubprovider({
    rpcUrl: "https://ropsten.infura.io"
  })
);
providerEngine.start();
var zeroEx = new ZeroEx(providerEngine, {
  networkId: 3
});
var openrelayBaseURL = "https://api.openrelay.xyz";

export default {
  data() {
    return {
      outcomes: undefined,
      selectedOrder: undefined,
      signedOrders: [],
      fillAmount: undefined,
      showDialog: false,
      currentOrder: undefined,
      asyncDataHolder: []
    };
  },

  components: {
    MakeOrderBtn
  },

  props: ["outcomeAddresses", "outcomeNames"],

  created: function() {
    this.updateList();
  },

  methods: {
    takeOrder: async function() {
      var takerAddress = window.web3.eth.coinbase;
      var shouldThrowOnInsufficientBalanceOrAllowance = true;
      const fillTakerTokenAmount = ZeroEx.toBaseUnitAmount(
        new BigNumber(this.fillAmount),
        18
      );
      const txHash = await zeroEx.exchange.fillOrderAsync(
        this.currentOrder,
        fillTakerTokenAmount,
        shouldThrowOnInsufficientBalanceOrAllowance,
        takerAddress
      );
      const txReceipt = await zeroEx.awaitTransactionMinedAsync(txHash);
      console.log("FillOrder transaction receipt: ", txReceipt);
    },

    orderDialog: function(signedOrder) {
      this.currentOrder = signedOrder;
      this.showDialog = true;
    },

    updateList: function() {
      var self = this;
      self.signedOrders = [];
      rp({
        method: "GET",
        uri: openrelayBaseURL + "/v0/orders?exchangeContractAddress=0x479cc461fecd078f766ecc58533d6f69580cf3ac",
        json: true
      }).then(orders => {
        for (var order of orders) {
          self.signedOrders.push(order);
        }
        self.loadAsyncData();
      });
    },

    loadAsyncData: function() {
      var self = this;
      self.signedOrders.map((order, i) => {
        OutcomeToken.getName(order.makerTokenAddress).then(makerTokenName => {
          OutcomeToken.getName(order.takerTokenAddress).then(takerTokenName => {
            self.$set(self.asyncDataHolder, i, {
              makerTokenName: makerTokenName,
              takerTokenName: takerTokenName
            });
          });
        });
      });
    }
  }
};
</script>

<style>
#orderList {
  display: inline-block;
  width: 100%;
}

.dialog {
  padding: 30px;
}
</style>
