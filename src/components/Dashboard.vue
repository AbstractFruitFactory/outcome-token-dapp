<template>
  <div class="dashboard">
    <h1>{{ msg }}</h1>
    <div>
      <input v-model="outcomeName">
      <input v-on:click="addOutcomeToken" id="AddOutcomeBtn" type="button" value="Add Outcome Token" :disabled="isDisabled">
      <form action="">
        <input type="radio" name="vote" v-model="selectedVote" v-bind:value="Vote.MET">Met<br>
        <input type="radio" name="vote" v-model="selectedVote" v-bind:value="Vote.NOT_MET">Not met
      </form>
      <ul>
        <li v-for="name in outcomeNames" :key="name.id">
            {{ name }} :  <input v-model="backValue">
            <input id="BackBtn" type="button" value="Back Outcome" @click="back(name)">
            <input id="VoteBtn" type="button" value="Vote for Outcome" @click="vote(name)">
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import OutcomeToken from "@/js/outcometoken.js";
import Voting from "@/js/voting.js";

export default {
  name: "dashboard",
  data() {
    return {
      msg: "Outcome Token Test DApp",
      outcomes: new Map(),
      outcomeNames: [],
      outcomeName: "",
      disabled: false,
      backValue: "",
      Vote: {
        UNKNOWN: 0,
        MET: 1,
        NOT_MET: 2
      },
      selectedVote: undefined
    };
  },
  computed: {
    isDisabled() {
      return this.disabled;
    }
  },
  beforeCreate: function() {
    Voting.init()
    OutcomeToken.init()
  },
  methods: {
    back: function(name) {
      OutcomeToken.back(this.outcomes.get(name), this.backValue);
    },

    vote: function(name) {
      Voting.vote(this.outcomes.get(name), this.selectedVote);
    },

    addOutcomeToken: function() {
      var self = this;
      self.disabled = true;
      OutcomeToken.deployNew(self.outcomeName).then(function(contract) {
        self.outcomes.set(self.outcomeName, contract.address);
        self.outcomeNames.push(self.outcomeName);
        self.outcomeName = "";
        self.disabled = false;
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
  display: block;
}

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
</style>
