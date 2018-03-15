<template>
  <div class="dashboard">
    <h1>{{ msg }}</h1>
    <div>
      <input v-model="outcomeName">
      <input v-on:click="addOutcomeToken" id="AddOutcomeBtn" type="button" value="Add Outcome Token" :disabled="isDisabled">
      <!--
      <form action="">
        <input type="radio" name="vote" v-model="selectedVote" v-bind:value="Vote.MET">Met<br>
        <input type="radio" name="vote" v-model="selectedVote" v-bind:value="Vote.NOT_MET">Not met
      </form>
      -->
      <ul>
        <li v-for="outcomeAddress in outcomes" :key="outcomeAddress.id">
            <OutcomeItem :address="outcomeAddress"></OutcomeItem>
        </li>
      </ul>
    </div>

    <!-- Trigger/Open The Modal -->
    <button id="myBtn">Open Modal</button>
    <!-- The Modal -->
    <div id="modal" class="modal">
        <!-- Modal content -->
        <div class="modal-content">
            <span class="close">&times;</span>
            <p>Some text in the Modal..</p>
        </div>
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
    background-color: rgb(0,0,0); /* Fallback color */
    background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
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
</style>
