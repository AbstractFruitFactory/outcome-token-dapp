<template>
  <div class="dashboard">
    <h1>{{ msg }}</h1>
    <div>
      <input v-model="outcomeName">
      <input v-on:click="addOutcomeToken" id="AddOutcomeBtn" type="button" value="Add Outcome Token" :disabled="isDisabled">
      <ul>
        <li v-for="outcomeAddress in outcomes" :key="outcomeAddress.id">
            <OutcomeItem :address="outcomeAddress"></OutcomeItem>
        </li><br>
        <br>
        <br>
      </ul>
    </div>
  </div>
</template>

<script>
import OutcomeToken from "@/js/outcometoken.js"
import Voting from "@/js/voting.js"
import OutcomeItem from "@/components/OutcomeItem.vue"

export default {
  name: "dashboard",
  data() {
    return {
      msg: "Outcome Token Test DApp",
      outcomes: [],
      outcomeName: "",
      disabled: false,
      backValue: undefined
    };
  },
  computed: {
    isDisabled() {
      return this.disabled;
    }
  },
  beforeCreate: function() {
    Voting.init();
    OutcomeToken.init();
  },
  components: {
    OutcomeItem
  },
  methods: {
    addOutcomeToken: function() {
      let self = this;
      self.disabled = true;
      let voting = Voting.getVotingAddress();

      OutcomeToken.deployNew(self.outcomeName, voting).then(function(address) {
        self.outcomes.push(address)
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
