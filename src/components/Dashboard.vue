<template>
    <v-app id="app" dark>
        <v-navigation-drawer fixed clipped>
          <v-toolbar flat>
            <v-list>
              <v-list-tile>
                <v-list-tile-title class="title">
                  Outcome Trading Platform
                </v-list-tile-title>
              </v-list-tile>
             </v-list>
          </v-toolbar>
          <v-divider></v-divider>
          <v-list dense class="pt-0">
              <v-list-tile @click="toggleContent(0)">
                <v-list-tile-action>
                  <v-icon>dashboard</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>Orders</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile @click="toggleContent(2)">
                <v-list-tile-action>
                  <v-icon>dashboard</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>Outcomes</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile @click="toggleContent(3)">
                <v-list-tile-action>
                  <v-icon>dashboard</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>Get WETH</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
        </v-navigation-drawer>
        <v-content>
        <v-container fill-height>
          <v-layout justify-center>
            <v-flex shrink>
              <div v-show="showOrderList == true" >
              <OrderList :outcomeAddresses="outcomeAddresses" :outcomeNames="outcomeNames"></OrderList>
            </div>
            <div v-show="showOutcomeContent == true">
              <OutcomeContent v-on:update="updateOutcomes" :items="items" :outcomeAddresses="outcomeAddresses" :outcomeNames="outcomeNames" :outcomeAmounts="outcomeAmounts"></OutcomeContent>
            </div>
            <div v-show="showWETHContent == true">
              <GetWethContent></GetWethContent>
            </div>
            </v-flex>
          </v-layout>
        </v-container>
        </v-content>
    </v-app>
</template>

<script>
import OutcomeToken from "@/js/outcometoken.js";
import Voting from "@/js/voting.js";
import OutcomeItem from "@/components/OutcomeItem.vue";
import GetWethContent from "@/components/GetWethContent.vue";
import SetAllowance from "@/components/SetAllowance.vue";
import OrderList from "@/components/OrderList.vue";
import OutcomeContent from "@/components/OutcomeContent.vue";
import OutcomeList from "@/js/outcomelist.js";
import { ZeroExError } from '0x.js/lib/src/types';
import * as Web3ProviderEngine from "web3-provider-engine";
import { InjectedWeb3Subprovider } from "@0xproject/subproviders";
import * as RPCSubprovider from "web3-provider-engine/subproviders/rpc";
import { Web3Wrapper } from "@0xproject/web3-wrapper";
import { ZeroEx } from "0x.js";
var content = {
  ORDER_LIST: 0,
  MAKE_ORDER: 1,
  ADD_OUTCOME: 2,
  GET_WETH: 3
};
var voting = ["-", "Met", "Not met"]

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
export default {
  name: "dashboard",
  data() {
    return {
      msg: "Outcome Token Test DApp",
      outcomeName: "",
      backValue: undefined,
      showMakeOrder: false,
      showOrderList: false,
      showOutcomeContent: false,
      showWETHContent: false,
      outcomeAddresses: undefined,
      outcomeNames: undefined,
      outcomeAmounts: undefined,
      items: []
    };
  },
  beforeCreate: function() {
    let self = this;
    Voting.init();
    OutcomeToken.init();
    OutcomeList.init().then(function() {
      self.updateOutcomes();
    });
  },
  components: {
    OutcomeItem,
    SetAllowance,
    OrderList,
    GetWethContent,
    OutcomeContent
  },
  methods: {
    toggleContent: function(contentNbr) {
      var self = this;
      self.showOrderList = false;
      self.showMakeOrder = false;
      self.showOutcomeContent = false;
      self.showWETHContent = false;
      switch (contentNbr) {
        case content.ORDER_LIST:
          self.showOrderList = true;
          break;
        case content.MAKE_ORDER:
          self.showMakeOrder = true;
          break;
        case content.ADD_OUTCOME:
          self.showOutcomeContent = true;
          break;
        case content.GET_WETH:
          self.showWETHContent = true;
          break;
      }
    },

    updateOutcomes: async function() {
      let self = this;
      self.outcomeAddresses = await OutcomeList.getOutcomeAddresses();
      self.outcomeNames = [];
      self.outcomeAmounts = [];
      self.outcomeAddresses.map(async (address, i) => {
        let name = await OutcomeToken.getName(address)
        let amount = await OutcomeToken.getAmount(address)
        let vote = await Voting.getVoteStatus(address)
        let allowance = await zeroEx.token.getProxyAllowanceAsync(address, window.web3.eth.coinbase)
        let enabled = (allowance > 0) ? true : false;
        self.$set(self.outcomeNames, i, name);
        self.$set(self.outcomeAmounts, i, amount);
        self.$set(self.items, i, { name: name, amount: amount, vote: voting[vote], enabled: enabled, address: address })
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 0 10px;
  padding: 5px;
}

a {
  color: #42b983;
}

#addOutcomeInput {
  width: 150px;
  align-content: center;
  margin: auto;
}

#title {
  padding-bottom: 5%;
  font-size: 120%;
}

.inline-block-center {
  text-align: center;
}
.inline-block-center div {
  display: inline-block;
  text-align: left;
}

.md-drawer {
  width: 230px;
  max-width: calc(100vw - 125px);
}
</style>
