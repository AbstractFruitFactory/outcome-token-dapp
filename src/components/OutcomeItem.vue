<template>
  <div>
    <md-dialog class="dialog" :md-active.sync="showBackDialog">
      <md-dialog-title>Back Outcome Token</md-dialog-title>
      Amount:
      <md-field>
        <md-input v-model="backValue"></md-input>
      </md-field>
      <md-button class="md-raised md-primary" @click="back()">Submit</md-button>
    </md-dialog>
    <md-dialog class="dialog" :md-active.sync="showVoteDialog">
      <md-dialog-title>Vote For Outcome</md-dialog-title>
  
      <md-radio name="vote" v-model="selectedVote" v-bind:value="Vote.MET">Met</md-radio>
      <md-radio name="vote" v-model="selectedVote" v-bind:value="Vote.NOT_MET">Not met</md-radio>
      <md-button class="md-raised md-primary" @click="vote()">Submit</md-button>
    </md-dialog>
    <md-dialog class="dialog" :md-active.sync="showRedeemDialog">
      <md-dialog-title>Redeem Tokens</md-dialog-title>
      Amount:
      <md-field>
        <md-input v-model="redeemValue"></md-input>
      </md-field>
      <md-button class="md-raised md-primary" @click="redeem()">Submit</md-button>
    </md-dialog>
    <md-dialog class="dialog" :md-active.sync="showTransferDialog">
      <md-dialog-title>Transfer Tokens</md-dialog-title>
      Amount:
      <md-field>
        <md-input v-model="transferValue"></md-input>
      </md-field>
      To:
      <md-field>
        <md-input v-model="recipient"></md-input>
      </md-field>
      <md-button class="md-raised md-primary" @click="transfer()">Submit</md-button>
    </md-dialog>
  
    <h2>{{ name }}</h2>
    <md-button class="md-raised md-primary" id="BackBtn" @click="showBackDialog = true">Back outcome</md-button>
    <md-button class="md-raised md-primary" id="VoteBtn" @click="showVoteDialog = true">Vote for outcome</md-button>
    <md-button class="md-raised md-primary" id="RedeemBtn" @click="showRedeemDialog = true">Redeem tokens</md-button>
    <md-button class="md-raised md-primary" id="TransferBtn" @click="showTransferDialog = true">Transfer tokens</md-button>
  </div>
</template>

<script>
  import OutcomeToken from "@/js/outcometoken.js";
  import Voting from "@/js/voting.js";
  
  export default {
    data() {
      return {
        backValue: undefined,
        redeemValue: undefined,
        transferValue: undefined,
        recipient: undefined,
        Vote: {
          UNKNOWN: 0,
          MET: 1,
          NOT_MET: 2
        },
        selectedVote: undefined,
        showBackDialog: false,
        showVoteDialog: false,
        showRedeemDialog: false,
        showTransferDialog: false
      };
    },
  
    props: ["address", "name"],
  
    methods: {
      back: function() {
        let self = this;
        OutcomeToken.back(this.address, this.backValue).then(function() {
          self.showBackDialog = false;
        });
      },
  
      vote: function() {
        let self = this;
        Voting.vote(this.address, this.selectedVote).then(function() {
          self.showVoteDialog = false;
        })
      },
  
      redeem: async function() {
        let self = this;
        let voteStatus = await Voting.getVoteStatus(this.address);
        let isOwner = await OutcomeToken.isOwner();
  
        if (voteStatus == self.Vote.NOT_MET && isOwner) {
          OutcomeToken.redeemBackerToken(this.address, self.redeemValue).then(function() {
            self.showRedeemDialog = false;
          });
        } else if (voteStatus == self.Vote.MET) {
          OutcomeToken.redeemRewardToken(this.address, self.redeemValue).then(function() {
            self.showRedeemDialog = false;
          });
        } else {
          console.log("Invalid action.");
        }
      },
  
      transfer: function() {
        let self = this;
        OutcomeToken.transferTokens(
          this.address,
          self.recipient,
          self.transferAmount
        ).then(function() {
          self.showTransferDialog = false;
        });
      }
    }
  };
</script>

<style>
  .dialog {
    padding: 30px;
  }
</style>
