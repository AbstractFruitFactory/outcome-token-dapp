<template>
  <div class="dashboard">
      <md-app>
        <md-app-toolbar class="md-primary">
          <span class="md-title">Outcome Token Test DApp</span>
        </md-app-toolbar>

        <md-app-drawer md-permanent="clipped">
          <md-list>
            <md-list-item @click="toggleContent(0)">
              <md-icon>move_to_inbox</md-icon>
              <span class="md-list-item-text">Orders</span>
            </md-list-item>
             <md-list-item @click="toggleContent(1)">
              <md-icon>move_to_inbox</md-icon>
              <span class="md-list-item-text">Make order</span>
            </md-list-item>
            <md-list-item @click="toggleContent(2)">
              <md-icon>move_to_inbox</md-icon>
              <span class="md-list-item-text">Add outcome</span>
            </md-list-item>
          </md-list>
        </md-app-drawer>
        <md-app-content>
          <div v-if="showMakeOrder == true">
            <SetAllowance :outcomes="outcomes"></SetAllowance>
            <GetWethBtn></GetWethBtn>
            <MakeOrder :outcomes="outcomes" @orderSubmitted="addOrder"></MakeOrder>
          </div>

          <div v-if="showOrderList == true">
            <OrderList ref="orderlist"></OrderList>
          </div>
          <div v-if="showAddOutcome == true">
            <h2>Enter outcome name:</h2>
            <div id="addOutcomeInput">
              <md-field>
                <md-input v-model="outcomeName"></md-input>
              </md-field>
            </div>
            <md-button class="md-raised md-primary" v-on:click="addOutcomeToken" id="AddOutcomeBtn" type="button">Add Outcome Token</md-button>
            <ul>
              <li v-for="outcomeAddress in Object.keys(outcomes)" :key="outcomeAddress">
                  <OutcomeItem :name="outcomes[outcomeAddress]" :address="outcomeAddress"></OutcomeItem>
              </li><br>
              <br>
              <br>
            </ul>
          </div>
        </md-app-content>
      </md-app>

  </div>
</template>

<script>
import OutcomeToken from "@/js/outcometoken.js";
import Voting from "@/js/voting.js";
import OutcomeItem from "@/components/OutcomeItem.vue";
import MakeOrder from "@/components/MakeOrder.vue";
import GetWethBtn from "@/components/GetWethBtn.vue";
import SetAllowance from "@/components/SetAllowance.vue";
import OrderList from "@/components/OrderList.vue";

var content = {
  ORDER_LIST: 0,
  MAKE_ORDER: 1,
  ADD_OUTCOME: 2
}

export default {
  name: "dashboard",
  data() {
    return {
      msg: "Outcome Token Test DApp",
      outcomes: {},
      outcomeName: "",
      backValue: undefined,
      showMakeOrder: false,
      showOrderList: false,
      showAddOutcome: false
    };
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

      OutcomeToken.deployNew(self.outcomeName, voting).then(function() {
        self.disabled = false;
      });
    },

    addOrder: function() {
      this.$refs.orderlist.updateList();
    },

    toggleContent: function(contentNbr) {
      var self = this
      self.showOrderList = false
      self.showMakeOrder = false
      self.showAddOutcome = false
      switch (contentNbr) {
        case content.ORDER_LIST:
          self.showOrderList = true
          break
        case content.MAKE_ORDER:
          self.showMakeOrder = true
          break
        case content.ADD_OUTCOME:
          self.showAddOutcome = true
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

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

.md-app {
    min-height: 350px;
    border: 1px solid rgba(#000, .12);
}

.md-drawer {
    width: 230px;
    max-width: calc(100vw - 125px);
}
</style>
