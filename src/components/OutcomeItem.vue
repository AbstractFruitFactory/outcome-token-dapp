<template>
    <div>
        {{ name }} : 
        <input v-model="backValue">
        <input id="BackBtn" type="button" value="Back Outcome" @click="back()">
        <input id="VoteBtn" type="button" value="Vote for Outcome" @click="vote()">
        <input v-model="redeemValue">
        <input id="RedeemBtn" type="button" value="Redeem Tokens" @click="redeem()">
        <input v-model="transferAmount">
        <input v-model="recipient">
        <input id="TransferBtn" type="button" value="Transfer Tokens" @click="transfer()">
    </div>
</template>

<script>
import OutcomeToken from "@/js/outcometoken.js";
import Voting from "@/js/voting.js";

export default {
  data() {
    return {
      name: undefined,
      backValue: undefined,
      redeemValue: undefined,
      transferAmount: undefined,
      recipient: undefined,
      Vote: {
        UNKNOWN: 0,
        MET: 1,
        NOT_MET: 2
      }
    }
  },

  props: ['address'],

  created: function() {
      let self = this
      OutcomeToken.getName(self.address).then(function(name) {
        self.name = name;
      })
  },

  methods: {

    back: function() {
      OutcomeToken.back(this.address, this.backValue);
    },

    vote: function() {
      Voting.vote(this.address, this.selectedVote);
    },

    redeem: async function() {
      let self = this;
      let voteStatus = await Voting.getVoteStatus(this.address);
      let isOwner = await OutcomeToken.isOwner(this.address);

      if (voteStatus == self.Vote.NOT_MET && isOwner) {
        OutcomeToken.redeemBackerToken(this.address, self.redeemValue);
      } else if (voteStatus == self.Vote.MET) {
        OutcomeToken.redeemRewardToken(this.address, self.redeemValue);
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
      )
    }
  }
}
</script>