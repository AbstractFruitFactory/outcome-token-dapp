<template>
  <div>
    <md-dialog class="dialog" :md-active.sync="showNewOutcomeDialog">
      <md-dialog-title>Create new outcome</md-dialog-title>
      Name:
      <md-field>
        <md-input v-model="outcomeName"></md-input>
      </md-field>
      <md-button class="md-raised md-primary" @click="addOutcomeToken()">Submit</md-button>
    </md-dialog>
  
    <md-dialog class="dialog" :md-active.sync="showBackDialog">
      <md-dialog-title>Back outcome</md-dialog-title>
      <md-field>
        <label for="Outcome Token">Outcome</label>
        <md-select v-model="selectedOutcomeAddress" name="Outcome token">
          <md-option v-for="(address, i) in outcomeAddresses" :key="address" :value="address">{{ outcomeNames[i] }}</md-option>
        </md-select>
      </md-field>
      Amount:
      <md-field>
        <md-input v-model="backValue"></md-input>
      </md-field>
      <md-button class="md-raised md-primary" @click="back()">Submit</md-button>
    </md-dialog>
  
  
    <md-button class="md-raised md-primary" @click="showNewOutcomeDialog = true">New outcome</md-button>
    <md-button class="md-raised md-primary" id="BackBtn" @click="showBackDialog = true">Back outcome</md-button>
  
    <div id="outcomeList">
      <h3>Outcomes:</h3>
      <md-table>
        <md-table-row>
          <md-table-head>Name</md-table-head>
          <md-table-head>Amount</md-table-head>
          <md-table-head>Enabled</md-table-head>
        </md-table-row>
  
        <md-table-row v-for="(address, i) in outcomeAddresses" :key="address">
          <md-table-cell>{{ outcomeNames[i] }}</md-table-cell>
          <md-table-cell>{{ outcomeAmounts[i]/10**18 }}</md-table-cell>
          <md-table-cell>
            <md-switch v-model="switchStatus" @change="enableOutcome(address)"></md-switch>
          </md-table-cell>
        </md-table-row>
      </md-table>
    </div>
  
  </div>
</template>

<script>
import OutcomeToken from "@/js/outcometoken.js";
import Voting from "@/js/voting.js";
import { ZeroEx } from "0x.js";
var Addresses = require("../../contract_addresses.json");
import { BigNumber } from "@0xproject/utils";
import * as Web3ProviderEngine from "web3-provider-engine";
import { InjectedWeb3Subprovider } from "@0xproject/subproviders";
import * as RPCSubprovider from "web3-provider-engine/subproviders/rpc";
import { Web3Wrapper } from "@0xproject/web3-wrapper";
import OutcomeList from "@/js/outcomelist.js"

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
  data() {
    return {
      showNewOutcomeDialog: false,
      outcomeName: undefined,
      selectedOutcomeAddress: undefined,
      backValue: undefined,
      showBackDialog: false,
      switchStatus: undefined
    };
  },

  props: ["outcomeAddresses", "outcomeNames", "outcomeAmounts"],

  methods: {
    addOutcomeToken: function() {
      let self = this;
      self.disabled = true;
      let voting = Voting.getVotingAddress();

      OutcomeToken.deployNew(self.outcomeName, voting).then(function() {
        self.$emit("update")
      })
    },

    back: function() {
      let self = this;
      OutcomeToken.back(self.selectedOutcomeAddress, self.backValue).then(
        function() {
          self.showBackDialog = false;
          self.$emit("update")
        }
      );
    },

    enableOutcome: function(address) {
      const setAllowTxHash = zeroEx.token.setUnlimitedProxyAllowanceAsync(
        address,
        window.web3.eth.coinbase
      );
    }
  }
};
</script>


<style lang="scss" scoped>
#outcomeList {
  width: 320px;
  max-width: 100%;
  vertical-align: top;
  border: 1px solid rgba(#000, 0.12);
}

.dialog {
  padding: 30px;
}
</style>