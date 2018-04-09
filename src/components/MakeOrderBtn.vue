
<template>
    <div>
        <v-dialog max-width="500px" v-model="showDialog">
            <v-card>
              <v-card-title>
                Make order
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-layout row-wrap>
                    <v-flex class="flex" xs6>
                    <v-select
                      :items="makerTokens"
                      v-model="makerTokenAddress"
                      label="Select maker token"
                      class="input-group--focused"
                      item-value="value"
                    ></v-select>
                     <v-select
                      :items="takerTokens"
                      v-model="takerTokenAddress"
                      label="Select taker token"
                      class="input-group--focused"
                      item-value="value"
                    ></v-select>
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field label="Maker token amount" v-model="makerTokenAmount"></v-text-field>
                    <v-text-field label="Taker token amount" v-model="takerTokenAmount"></v-text-field>
                  </v-flex>
                </v-layout>
                </v-container>
                <v-btn @click="makeOrder()">Submit</v-btn>
              </v-card-text>
            </v-card>
        </v-dialog>
        <v-btn @click="showDialog = true">Make Order</v-btn>
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
var WETHaddress = zeroEx.etherToken.getContractAddressIfExists();


export default {
  data() {
    return {
      makerTokenAddress: undefined,
      takerTokenAddress: undefined,
      makerTokenAmount: undefined,
      takerTokenAmount: undefined,
      signedOrder: undefined,
      showDialog: false,
      makerTokens: [],
      takerTokens: []
    };
  },

  created: function() {
    this.exchangeAddress = Addresses.EXCHANGE_ADDRESS;
  },

  watch: {
    outcomes: function(outcomes) {
      let self = this
      let count = 0
      outcomes.map((outcome, i) => {
        count = i
        self.$set(self.makerTokens, i, { text: outcome.name, value: outcome.address })
        self.$set(self.takerTokens, i, { text: outcome.name, value: outcome.address })
      })
      self.$set(self.makerTokens, count + 1, { text: 'WETH', value: WETHaddress })
      self.$set(self.takerTokens, count + 1, { text: 'WETH', value: WETHaddress })
    }
  },

  props: ["outcomeAddresses", "outcomes"],

  methods: {
    makeOrder: async function() {
      var self = this;
      var makerAddress = window.web3.eth.coinbase;
      var duration = 60*60; // 1 hour
      const order = {
        maker: makerAddress,
        taker: ZeroEx.NULL_ADDRESS,
        makerTokenAddress: this.makerTokenAddress,
        takerTokenAddress: this.takerTokenAddress,
        exchangeContractAddress: Addresses.EXCHANGE_ADDRESS,
        salt: ZeroEx.generatePseudoRandomSalt(),
        makerFee: new BigNumber(0),
        takerFee: new BigNumber(0),
        makerTokenAmount: ZeroEx.toBaseUnitAmount(
          new BigNumber(this.makerTokenAmount),
          18
        ),
        takerTokenAmount: ZeroEx.toBaseUnitAmount(
          new BigNumber(this.takerTokenAmount),
          18
        ),
        expirationUnixTimestampSec: new BigNumber(Date.now() + 3600)
      };
      var feePromise = rp({
        method: "POST",
        uri: openrelayBaseURL + "/v0/fees",
        body: order,
        json: true
      }).then(async function(feeResponse) {
        order.makerFee = new BigNumber(feeResponse.makerFee);
        order.takerFee = new BigNumber(feeResponse.takerFee);
        order.taker = feeResponse.takerToSpecify;
        order.feeRecipient = feeResponse.feeRecipient;
        const orderHash = ZeroEx.getOrderHashHex(order);
        const shouldAddPersonalMessagePrefix = true;

        const ecSignature = await zeroEx.signOrderHashAsync(
          orderHash,
          makerAddress,
          shouldAddPersonalMessagePrefix
        );

        // Append signature to order
        var signedOrder = {
          ...order,
          ecSignature
        };
        await zeroEx.exchange.validateOrderFillableOrThrowAsync(signedOrder);
        rp({
          method: "POST",
          uri: openrelayBaseURL + "/v0/order",
          body: signedOrder,
          json: true
        });
        self.showDialog = false;
        self.$emit("orderSubmitted", signedOrder);
      });
    }
  }
};
</script>
<style>

.flex {
  margin: 10px;
}

</style>
