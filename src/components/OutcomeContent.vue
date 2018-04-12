<template>
  <div>
    <v-snackbar :timeout="6000" top v-model="snackbar">
      You are not the owner of this outcome!
      <v-btn flat color="pink" @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>
    <v-dialog max-width="800px" v-model="helpDialog">
      <v-card>
        <v-card-text>
          <p>
            This view shows the currently deployed outcomes on the network. The table shows the outcome name, the amount of the outcome token that the current account owns, the vote status, and if it is enabled for trading.
          </p>
          <p>
            The back button allows you to back the outcome, which gives you outcome tokens in exchange for Ether. You can only back an outcome if you are the creator of that outcome.
          </p>
          <p>
            The redeem button lets you redeem tokens, depending on the vote status. If the vote is "met", you will be able to exchange outcome tokens for Ether. If the vote is "not met", and you are the backer, you can redeem the whole backed amount.
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-btn slot="activator" color="pink" dark fab fixed top right @click="helpDialog = true">
      <v-icon>help</v-icon>
    </v-btn>
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
            <v-radio v-for="vote in Vote" :key="vote" :label="nbrToVote(vote)" :value="vote">
            </v-radio>
          </v-radio-group>
          <v-btn @click="vote()">Submit</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-container grid-list-md text-xs-center fluid>
      <v-layout child-flex row wrap>
        <v-flex xs12>
          <v-btn id="newOutcomeBtn" @click="showNewOutcomeDialog = true">New outcome</v-btn>
        </v-flex>
        <v-flex align-content-start xs2 class="filter">
          <v-checkbox label="Created by me" v-model="deployedFilter" @change="applyFilter()"></v-checkbox>
          <v-checkbox label="Created by others" v-model="deployedOthersFilter" @change="applyFilter()"></v-checkbox>
          <v-checkbox label="Met" v-model="metVoteFilter" @change="applyFilter()"></v-checkbox>
          <v-checkbox label="Not met" v-model="notMetVoteFilter" @change="applyFilter()"></v-checkbox>
          <v-checkbox label="Unvoted" v-model="unVotedFilter" @change="applyFilter()"></v-checkbox>
          <v-checkbox label="Has amount" v-model="amountFilter" @change="applyFilter()"></v-checkbox>
        </v-flex>
        <v-flex xs9>
          <v-card id="outcomeList">
            <v-card-title>
              Outcomes
              <v-spacer></v-spacer>
              <v-text-field append-icon="search" label="Search" single-line hide-details v-model="searchText">
              </v-text-field>
              <v-btn @click="search()">Search</v-btn>
            </v-card-title>
            <v-data-table :headers="headers" :items="outcomes" :loading="isLoading" hide-actions class="elevation-1">
              <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
              <template slot="items" slot-scope="props">
            <td class="text-xs-left">{{ props.item.name }}</td>
            <td class="text-xs-left">{{ parseInt(props.item.amount)/10**18 }}</td>
            <td class="text-xs-left">{{ props.item.vote }}</td>
            <td class="text-xs-left"><v-switch v-model="props.item.enabled" @click="setEnabled(props.item.address, props.item.enabled)"></v-switch></td>
            <td class="text-xs-left"><v-btn block round small @click="showBackDialogFunc(props.item.address)">Back</v-btn></td>
            <td class="text-xs-left"><v-btn block round small @click="showRedeemDialogFunc(props.item.address)">Redeem</v-btn></td>
            <td class="text-xs-left"><v-btn block round small @click="showVoteDialogFunc(props.item.address)">Vote</v-btn></td>
    </template>
      </v-data-table>
    </v-card>
      </v-flex>
    
    </v-layout>
    </v-container>
  </div>
</template>

<script>
  import OutcomeToken from "@/js/outcometoken.js";
  import Voting from "@/js/voting.js";
  import {
    ZeroEx
  } from "0x.js";
  var Addresses = require("../../contract_addresses.json");
  import {
    BigNumber
  } from "@0xproject/utils";
  import * as Web3ProviderEngine from "web3-provider-engine";
  import {
    InjectedWeb3Subprovider
  } from "@0xproject/subproviders";
  import * as RPCSubprovider from "web3-provider-engine/subproviders/rpc";
  import {
    Web3Wrapper
  } from "@0xproject/web3-wrapper";
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
        searchFilter: '',
        searchText: undefined,
        snackbar: false,
        showNewOutcomeDialog: false,
        outcomeName: undefined,
        selectedOutcomeAddress: undefined,
        backValue: undefined,
        showBackDialog: false,
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
        deployedFilter: true,
        deployedOthersFilter: true,
        metVoteFilter: true,
        notMetVoteFilter: true,
        unVotedFilter: true,
        amountFilter: false,
        headers: [{
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
        outcomes: [],
        helpDialog: false
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
  
      outcomesProp: function(_outcomes) {
        this.outcomes = _outcomes
        console.log(this.outcomes)
      }
    },
  
    props: ["outcomeAddresses", "outcomesProp"],
  
    methods: {
      addOutcomeToken: function() {
        let self = this;
        self.disabled = true;
        let voting = Voting.getVotingAddress();
        OutcomeToken.deployNew(self.outcomeName, voting).then(function(hash) {
          self.showNewOutcomeDialog = false
          self.isLoading = true
          self.waitForReceipt(hash, function(receipt) {
            self.isLoading = false;
            self.$emit("update", self.filter);
          })
        });
      },
  
      back: function() {
        let self = this;
        OutcomeToken.isOwner(self.selectedOutcomeAddress).then(function(result) {
          if (result) {
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
          } else {
            self.snackbar = true;
          }
        })
      },
  
      redeem: async function() {
        let self = this;
        let address = self.selectedOutcomeAddress;
        let voteStatus = await Voting.getVoteStatus(address);
        let isOwner = await OutcomeToken.isOwner(address);
        OutcomeToken.redeemBackerToken(address, self.redeemValue).then(
          function(hash) {
            self.isLoading = true
            self.showRedeemDialog = false;
            self.waitForReceipt(hash, function(receipt) {
              self.isLoading = false;
            })
          }
        );
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
        if (!enabled) {
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
  
      applyFilter: function() {
        let self = this
        let filter = {
          name: self.searchFilter,
          amount: self.amountFilter,
          deployed: self.deployedFilter,
          deployedOthers: self.deployedOthersFilter,
          metVote: self.metVoteFilter,
          notMetVote: self.notMetVoteFilter,
          unVoted: self.unVotedFilter
        }
        self.$emit("update", filter)
      },
  
      search: function() {
        this.searchFilter = this.searchText
        this.applyFilter()
      },
  
      nbrToVote: function(nbr) {
        switch (nbr) {
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
        web3.eth.getTransactionReceipt(hash, function(err, receipt) {
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
            window.setTimeout(function() {
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

<style>
  .tableTitle {
    margin-top: 20px;
  }
  
  .help-card {
    margin-top: 80px;
    margin-right: 100px;
  }
</style>
