
<template>
  <div>
    <v-dialog max-width="800px" v-model="helpDialog">
      <v-card>
        <v-card-text>
          <p>
            This view lists all the current available orders. Each order has a maker token and taker token, along with the corresponding quantities.
            The maker token is the token that the maker of the order wants to trade in exchange for a taker token. 
          </p>
          <p>
            In order to fill an order, simply click on the order in the table. Then, specify the amount you want to fill.  
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-btn slot="activator" color="pink" dark fab fixed top right @click="helpDialog = true">
      <v-icon>help</v-icon>
    </v-btn>
    <v-dialog max-width="500px" v-model="showDialog">
      <v-card>
        <v-card-title>
          Fill order
        </v-card-title>
        <v-card-text>
          <v-text-field label="Amount" v-model="fillAmount"></v-text-field>
          <v-btn @click="takeOrder()">Submit</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  
    <MakeOrderBtn @orderSubmitted="updateList()" :outcomes="outcomes" :outcomeAddresses="outcomeAddresses"></MakeOrderBtn>
    <div>
      <h3 class="tableTitle">Orders</h3>
      <template>
        <v-data-table
          :headers="headers"
          :items="orders"
          :loading="isLoading"
          hide-actions
          class="elevation-1"
        >
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template slot="items" slot-scope="props">
              <td @click="orderDialog(props.item.signedOrder)" class="text-xs-left">{{ props.item.makerTokenAmount/10**18 }} {{ props.item.makerTokenName }}</td>
              <td @click="orderDialog(props.item.signedOrder)" class="text-xs-left">{{ props.item.takerTokenAmount/10**18 }} {{ props.item.takerTokenName }}</td>
            </template>
        </v-data-table>
      </template>
         
      </div>
    </div>
</template>

<script>
  import {
    ZeroEx
  } from "0x.js";
  var Addresses = require("../../contract_addresses.json");
  import {
    BigNumber
  } from "@0xproject/utils";
  import OutcomeToken from "@/js/outcometoken.js";
  import Voting from "@/js/voting.js";
  import * as Web3ProviderEngine from "web3-provider-engine";
  import {
    InjectedWeb3Subprovider
  } from "@0xproject/subproviders";
  import * as RPCSubprovider from "web3-provider-engine/subproviders/rpc";
  import {
    Web3Wrapper
  } from "@0xproject/web3-wrapper";
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
        selectedOrder: undefined,
        signedOrders: [],
        fillAmount: undefined,
        showDialog: false,
        currentOrder: undefined,
        asyncDataHolder: [],
        headers: [{
            sortable: false,
            text: "Maker token"
          },
          {
            sortable: false,
            text: "Taker token"
          }
        ],
        orders: [],
        isLoading: false,
        helpDialog: false
      };
    },
  
    components: {
      MakeOrderBtn
    },
  
    props: ["outcomeAddresses", "outcomes"],
  
    created: function() {
      this.updateList();
    },
  
    methods: {
      takeOrder: async function() {
        var self = this
        let currentAccount
        window.web3.eth.getAccounts((err, accounts) => {
            currentAccount = accounts[0]
        })
        var takerAddress = currentAccount;
        var shouldThrowOnInsufficientBalanceOrAllowance = true;
        const fillTakerTokenAmount = ZeroEx.toBaseUnitAmount(
          new BigNumber(self.fillAmount),
          18
        );
        const txHash = await zeroEx.exchange.fillOrderAsync(
          self.currentOrder,
          fillTakerTokenAmount,
          shouldThrowOnInsufficientBalanceOrAllowance,
          takerAddress
        );
        const txReceipt = await zeroEx.awaitTransactionMinedAsync(txHash);
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
            order["takerTokenAmount"] = new BigNumber(order["takerTokenAmount"])
            order["makerTokenAmount"] = new BigNumber(order["makerTokenAmount"])
            order["expirationUnixTimestampSec"] = new BigNumber(order["expirationUnixTimestampSec"])
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
              self.$set(self.orders, i, {
                makerTokenAmount: order.makerTokenAmount,
                makerTokenName: makerTokenName,
                takerTokenAmount: order.takerTokenAmount,
                takerTokenName: takerTokenName,
                signedOrder: order
              });
            });
          });
        });
      }
    }
  };
</script>


<style>
  .tableTitle {
    margin-top: 20px;
  }
</style>
