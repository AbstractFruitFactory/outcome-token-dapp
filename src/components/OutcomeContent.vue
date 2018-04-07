<template>
  <div>
    <v-dialog max-width="500px" v-model="showNewOutcomeDialog">
      <v-card>
        <v-card-title>
          Create new outcome
        </v-card-title>
        <v-card-text>
          <v-text-field label="Name" v-model="outcomeName"></v-text-field>
          <v-btn @click="addOutcomeToken()">Submit</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog max-width="500px" v-model="showBackDialog">
      <v-card>
        <v-card-title>
          Back Outcome
        </v-card-title>
        <v-card-text>
          <v-text-field label="Amount" v-model="backValue"></v-text-field>
          <v-btn @click="back()">Submit</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog max-width="500px" v-model="showRedeemDialog">
      <v-card>
        <v-card-title>
          Redeem tokens
        </v-card-title>
        <v-card-text>
          <v-text-field label="Amount" v-model="redeemValue"></v-text-field>
          <v-btn @click="redeem()">Submit</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog max-width="500px" v-model="showVoteDialog">
      <v-card>
        <v-card-title>
          Vote on outcome
        </v-card-title>
        <v-card-text>
          <v-radio-group v-model="selectedVote">
            <v-radio
              v-for="vote in Vote"
              :key="vote"
              :label="nbrToVote(vote)"
              :value="vote">
            </v-radio>
          </v-radio-group>
          <v-btn @click="vote()">Submit</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>


    <v-btn id="newOutcomeBtn" @click="showNewOutcomeDialog = true">New outcome</v-btn>
  
    <div id="outcomeList">
      <h3>Outcomes</h3>
      <v-data-table
        :headers="headers"
        :items="outcomes"
        :loading="isLoading"
        hide-actions
        class="elevation-1"
      >
        <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
        <template slot="items" slot-scope="props">
          <td class="text-xs-left">{{ props.item.name }}</td>
          <td class="text-xs-left">{{ parseInt(props.item.amount)/10**18 }}</td>
          <td class="text-xs-left">{{ props.item.vote }}</td>
          <td class="text-xs-left"><v-switch v-model="props.item.enabled" @click="setEnabled(props.item.address, props.item.enabled)"></v-switch></td>
          <td class="text-xs-left"><v-btn @click="showBackDialogFunc(props.item.address)">Back</v-btn></td>
          <td class="text-xs-left"><v-btn @click="showRedeemDialogFunc(props.item.address)">Redeem</v-btn></td>
          <td class="text-xs-left"><v-btn @click="showVoteDialogFunc(props.item.address)">Vote</v-btn></td>
        </template>
      </v-data-table>
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
      switchStatus: [],
      Vote: {
        MET: 1,
        NOT_MET: 2
      },
      showVoteDialog: false,
      selectedVote: undefined,
      redeemValue: undefined,
      showRedeemDialog: false,
      voteStatus: {},
      isLoading: false,
      headers: [
        {
          sortable: false,
          text: "Name"
        },
        {
          sortable: false,
          text: "Amount"
        },
        {
          sortable: false,
          text: "Vote status"
        },
        {
          sortable: false,
          text: "Enabled"
        },
        {
          sortable: false,
          text: ""
        },
        {
          sortable: false,
          text: ""
        },
        {
          sortable: false,
          text: ""
        }
      ],
      outcomes: []
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
        self.voteStatus = Object.assign({}, self.voteStatus);
      });
    },

    outcomes: function(outcomes) {
      this.outcomes = outcomes
    }
  },

  props: ["outcomeAddresses", "outcomes"],

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
        function(hash) {
          self.showBackDialog = false;
          self.isLoading = true
          self.waitForReceipt(hash, function(receipt) {
            self.isLoading = false;
            self.$emit("update");
          })
         
        }
      );
    },

    redeem: async function() {
      let self = this;
      let address = self.selectedOutcomeAddress;
      let voteStatus = await Voting.getVoteStatus(address);
      let isOwner = await OutcomeToken.isOwner(address);

      if ((voteStatus == self.Vote.NOT_MET && isOwner) || (voteStatus == self.Vote.MET && !isOwner)) {
        OutcomeToken.redeemBackerToken(address, self.redeemValue).then(
          function(hash) {
            self.isLoading = true
            self.showRedeemDialog = false;
            self.waitForReceipt(hash, function(receipt) {
              self.isLoading = false;
            })
          }
        );
      } else {
        console.log("Invalid action.");
      }
    },

    vote: function() {
      let self = this;
      Voting.vote(self.selectedOutcomeAddress, self.selectedVote).then(
        function(hash) {
          self.isLoading = true;
          self.showVoteDialog = false;
          self.waitForReceipt(hash, function(receipt) {
            self.isLoading = false;
            self.$emit("update");
          })
        }
      );
    },

    setEnabled: function(address, enabled) {
      if(!enabled) {
        const setAllowTxHash = zeroEx.token.setUnlimitedProxyAllowanceAsync(
          address,
          window.web3.eth.coinbase
        );
      } else {
        const setAllowTxHash = zeroEx.token.setProxyAllowanceAsync(
          address,
          window.web3.eth.coinbase,
          new BigNumber(0)
        );
      }
    },

    nbrToVote: function(nbr) {
        switch(nbr) {
          case 0:
            return "-"
            break;
          case 1:
            return "Met"
            break;
          case 2:
            return "Not met"
            break;
          default:
            return "ERROR: INVALID NBR"
        }
    },
    
    waitForReceipt: function(hash, cb) {
      let self = this
      web3.eth.getTransactionReceipt(hash, function (err, receipt) {
        if (err) {
          error(err);
        }

        if (receipt !== null) {
          // Transaction went through
          if (cb) {
            cb(receipt);
          }
        } else {
          // Try again in 1 second
          window.setTimeout(function () {
            self.waitForReceipt(hash, cb);
          }, 1000);
        }
      });
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