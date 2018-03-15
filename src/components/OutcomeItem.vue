<template>
    <div>
        <!-- The Modal -->
        <div ref="modal" class="modal">
            <!-- Modal content -->
            <div id="backModalContent" ref="backModalContent" class="modal-content">
                <span v-on:click="closeModalWindow()" class="close">&times;</span>
                <p>
                    Amount: <input v-model="backValue">
                    <input type="button" value="Submit" @click="back()">
                </p>
            </div>
            <div id="voteModalContent" ref="voteModalContent" class="modal-content">
                <span v-on:click="closeModalWindow()" class="close">&times;</span>
                <form>
                    <input type="radio" name="vote" v-model="selectedVote" v-bind:value="Vote.MET">Met<br>
                    <input type="radio" name="vote" v-model="selectedVote" v-bind:value="Vote.NOT_MET">Not met
                </form>
                <input type="button" value="Submit" @click="vote()">
            </div>
            <div id="redeemModalContent" ref="redeemModalContent" class="modal-content">
                <span v-on:click="closeModalWindow()" class="close">&times;</span>
                <p>
                    Amount: <input v-model="redeemValue">
                    <input type="button" value="Submit" @click="redeem()">
                </p>
            </div>
            <div id="transferModalContent" ref="transferModalContent" class="modal-content">
                <span v-on:click="closeModalWindow()" class="close">&times;</span>
                <p>
                    Amount: <input v-model="transferValue"><br>
                    <br>
                    To: <input v-model="recipient"><br>
                    <br>
                    <input type="button" value="Submit" @click="redeem()">
                </p>
            </div>
        </div>

        <h2>{{ name }}</h2>
        <input id="BackBtn" type="button" value="Back Outcome" @click="showModalWindow('back')">
        <input id="VoteBtn" type="button" value="Vote for Outcome" @click="showModalWindow('vote')">
        <input id="RedeemBtn" type="button" value="Redeem Tokens" @click="showModalWindow('redeem')">
        <input id="TransferBtn" type="button" value="Transfer Tokens" @click="showModalWindow('transfer')">
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
      transferValue: undefined,
      recipient: undefined,
      Vote: {
        UNKNOWN: 0,
        MET: 1,
        NOT_MET: 2
      },
      selectedVote: undefined
    };
  },

  props: ["address"],

  created: function() {
    let self = this;
    OutcomeToken.getName(self.address).then(function(name) {
      self.name = name;
    });
  },

  methods: {
    back: function() {
      let self = this;
      OutcomeToken.back(this.address, this.backValue).then(function() {
        self.$refs.modal.style.display = "none";
        self.$refs.backModalContent.style.display = "none";
      });
    },

    vote: function() {
        let self = this;
        Voting.vote(this.address, this.selectedVote).then(function() {
            self.$refs.modal.style.display = "none";
            self.$refs.voteModalContent.style.display = "none";
        })
    },

    redeem: async function() {
      let self = this;
      let voteStatus = await Voting.getVoteStatus(this.address);
      let isOwner = await OutcomeToken.isOwner(this.address);

      if (voteStatus == self.Vote.NOT_MET && isOwner) {
        OutcomeToken.redeemBackerToken(this.address, self.redeemValue).then(function() { 
            self.$refs.modal.style.display = "none";
            self.$refs.redeemModalContent.style.display = "none";
        });
      } else if (voteStatus == self.Vote.MET) {
        OutcomeToken.redeemRewardToken(this.address, self.redeemValue).then(function() {
            self.$refs.modal.style.display = "none";
            self.$refs.redeemModalContent.style.display = "none";
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
            self.$refs.modal.style.display = "none";
            self.$refs.transferModalContent.style.display = "none";
      });
    },

    showModalWindow: function(context) {
        let self = this
        switch(context) {
            case "back":
                self.$refs.backModalContent.style.display= "block";
                break;
            case "vote":
                self.$refs.voteModalContent.style.display = "block";
                break;
            case "redeem":
                self.$refs.redeemModalContent.style.display = "block";
                break;
            case "transfer":
                self.$refs.transferModalContent.style.display = "block";
                break;
            default:
                console.log("Invalid context.")
        }
      this.$refs.modal.style.display = "block";
    },

    closeModalWindow: function() {
        this.$refs.backModalContent.style.display = "none";
        this.$refs.voteModalContent.style.display = "none";
        this.$refs.redeemModalContent.style.display = "none";
        this.$refs.transferModalContent.style.display = "none";
        this.$refs.modal.style.display = "none";
    }
  }
};
</script>

<style>
/* The Modal (background) */
.modal {
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
  background-color: #fefefe;
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%; /* Could be more or less, depending on screen size */
}

/* The Close Button */
.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

#backModalContent {
     display: none;
}

#voteModalContent {
     display: none;
}

#redeemModalContent {
     display: none;
}

#transferModalContent {
     display: none;
}

</style>