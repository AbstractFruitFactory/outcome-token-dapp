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

    <md-dialog class="dialog" :md-active.sync="showVoteDialog">
      <md-dialog-title>Vote For Outcome</md-dialog-title>
  
      <md-radio name="vote" v-model="selectedVote" v-bind:value="Vote.MET">Met</md-radio>
      <md-radio name="vote" v-model="selectedVote" v-bind:value="Vote.NOT_MET">Not met</md-radio>
      <md-button class="md-raised md-primary" @click="vote()">Submit</md-button>
    </md-dialog>

    <md-dialog class="dialog" :md-active.sync="showBackDialog">
      <md-dialog-title>Back outcome</md-dialog-title>
      Amount:
      <md-field>
        <md-input v-model="backValue"></md-input>
      </md-field>
      <md-button class="md-raised md-primary" @click="back()">Submit</md-button>
    </md-dialog>

    <md-dialog class="dialog" :md-active.sync="showRedeemDialog">
      <md-dialog-title>Redeem Tokens</md-dialog-title>
      Amount:
      <md-field>
        <md-input v-model="redeemValue"></md-input>
      </md-field>
      <md-button class="md-raised md-primary" @click="redeem()">Submit</md-button>
    </md-dialog>
  
    
    <md-button class="md-raised md-primary" @click="showNewOutcomeDialog = true">New outcome</md-button>
  
    <div id="outcomeList">
      <h3>Outcomes:</h3>
      <md-table>
        <md-table-row>
          <md-table-head>Name</md-table-head>
          <md-table-head>Amount</md-table-head>
          <md-table-head>Enabled</md-table-head>
          <md-table-head>Vote Status</md-table-head>
        </md-table-row>
  
        <md-table-row v-for="(address, i) in outcomeAddresses" :key="address">
          <md-table-cell>{{ outcomeNames[i] }}</md-table-cell>
          <md-table-cell>{{ outcomeAmounts[i]/10**18 }}</md-table-cell>
          <md-table-cell>
            <md-switch v-model="switchStatus" @change="enableOutcome(address)"></md-switch>
          </md-table-cell>
          <md-table-cell>{{ voteStatus[address] }}</md-table-cell>
          <md-table-cell>
            <md-button class="md-raised md-primary" id="BackBtn" @click="showBackDialogFunc(address)">Back</md-button>
          </md-table-cell>
          <md-table-cell>
            <md-button class="md-raised md-primary" id="RedeemBtn" @click="showRedeemDialogFunc(address)">Redeem</md-button>
          </md-table-cell>
          <md-table-cell>
             <md-button class="md-raised md-primary" id="VoteBtn" @click="showVoteDialogFunc(address)">Vote</md-button>
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
import OutcomeList from "@/js/outcomelist.js";

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
      switchStatus: undefined,
      Vote: {
        UNKNOWN: 0,
        MET: 1,
        NOT_MET: 2
      },
      showVoteDialog: false,
      selectedVote: undefined,
      redeemValue: undefined,
      showRedeemDialog: false,
      voteStatus: {}
    };
  },

  watch: {
    outcomeAddresses: function() {
      let self = this;
      self.outcomeAddresses.map(async address => {
        let vote = await Voting.getVoteStatus(address);
        vote = vote.c[0] // Convert from BigNumber to number.
        switch (vote) {
          case self.Vote.MET:
            self.voteStatus[address] = "Met";
            break;
          case self.Vote.NOT_MET:
            self.voteStatus[address] = "Not met";
            break;
          default:
            self.voteStatus[address] = "-";
            break;
        }
      });
    }
  },

  props: ["outcomeAddresses", "outcomeNames", "outcomeAmounts"],

  methods: {
    addOutcomeToken: function() {
      let self = this;
      self.disabled = true;
      let voting = Voting.getVotingAddress();

      OutcomeToken.deployNew(self.outcomeName, voting).then(function(address) {
        self.voteStatus[address] = "-";
        self.$emit("update");
      });
    },

    back: function() {
      let self = this;
      OutcomeToken.back(self.selectedOutcomeAddress, self.backValue).then(
        function() {
          self.showBackDialog = false;
          self.$emit("update");
        }
      );
    },

    redeem: async function() {
      let self = this;
      let address = self.selectedOutcomeAddress;
      let voteStatus = await Voting.getVoteStatus(address);
      let isOwner = await OutcomeToken.isOwner(address);

      if (voteStatus == self.Vote.NOT_MET && isOwner) {
        OutcomeToken.redeemBackerToken(address, self.redeemValue).then(
          function() {
            self.showRedeemDialog = false;
          }
        );
      } else if (voteStatus == self.Vote.MET) {
        OutcomeToken.redeemRewardToken(address, self.redeemValue).then(
          function() {
            self.showRedeemDialog = false;
          }
        );
      } else {
        console.log("Invalid action.");
      }
    },

    vote: function() {
      let self = this;
      Voting.vote(self.selectedOutcomeAddress, self.selectedVote).then(
        function() {
          if (self.selectedVote == self.Vote.MET) {
            self.voteStatus[self.selectedOutcomeAddress] = "Met";
          } else if (self.selectedVote == self.Vote.NOT_MET) {
            self.voteStatus[self.selectedOutcomeAddress] = "Not met";
          }
          self.showVoteDialog = false;
        }
      );
    },

    enableOutcome: function(address) {
      const setAllowTxHash = zeroEx.token.setUnlimitedProxyAllowanceAsync(
        address,
        window.web3.eth.coinbase
      );
    },

    showBackDialogFunc: function(address) {
      this.showBackDialog = true;
      this.selectedOutcomeAddress = address;
    },

    showRedeemDialogFunc: function(address) {
      this.showRedeemDialog = true;
      this.selectedOutcomeAddress = address;
    },

    showVoteDialogFunc: function(address) {
      this.showVoteDialog = true;
      this.selectedOutcomeAddress = address;
    }
  }
};
</script>


<style lang="scss" scoped>
#outcomeList {
  width: 1000px;
  max-width: 100%;
  vertical-align: top;
  border: 1px solid rgba(#000, 0.12);
}

.dialog {
  padding: 30px;
}
</style>