<template>
  <div class="dashboard">
    <div id="title">
      <h1>{{ msg }}</h1>
    </div>
    <div id="topContainer">
      <div id="innerContainer">
        <SetAllowance class="topContainerChild" :outcomes="outcomes"></SetAllowance>
        <MakeOrder class="topContainerChild" :outcomes="outcomes" @orderSubmitted="addOrder"></MakeOrder>
        <GetWethBtn class="topContainerChild"></GetWethBtn>
      </div>
    </div>
    <OrderList ref="orderlist" :outcomes="outcomes"></OrderList>
    <div>
      <h2>Enter outcome name:</h2>
      <div id="addOutcomeInput">
        <md-field>
          <md-input v-model="outcomeName"></md-input>
        </md-field>
      </div>
      <md-button class="md-raised md-primary" v-on:click="addOutcomeToken" id="AddOutcomeBtn" type="button" :disabled="isDisabled">Add Outcome Token</md-button>
      <ul>
        <li v-for="outcomeAddress in Object.keys(outcomes)" :key="outcomeAddress">
            <OutcomeItem :name="outcomes[outcomeAddress]" :address="outcomeAddress"></OutcomeItem>
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
import MakeOrder from "@/components/MakeOrder.vue"
import GetWethBtn from "@/components/GetWethBtn.vue"
import SetAllowance from "@/components/SetAllowance.vue"
import OrderList from "@/components/OrderList.vue"

export default {
  name: "dashboard",
  data() {
    return {
      msg: "Outcome Token Test DApp",
      outcomes: {},
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
    OutcomeItem,
    SetAllowance,
    OrderList,
    GetWethBtn,
    MakeOrder
  },
  methods: {
    addOutcomeToken: function() {
      let self = this;
      self.disabled = true;
      let voting = Voting.getVotingAddress();

      OutcomeToken.deployNew(self.outcomeName, voting).then(function(address) {
        self.outcomes[address] = self.outcomeName
        self.outcomeName = "";
        self.disabled = false;
      });
    },

    addOrder: function() {
      this.$refs.orderlist.updateList()
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

#addOutcomeInput {
  width: 150px;
  align-content: center;
  margin: auto;
  
}

#title {
  padding-bottom: 5%;
  font-size: 120%;
}

.inline-block-center {
  text-align: center;
}
.inline-block-center div {
  display: inline-block;
  text-align: left;
}

#topContainer {
  display: flex;
  justify-content: center;
}
</style>
