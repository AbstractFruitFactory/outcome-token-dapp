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
            <md-list-item @click="toggleContent(2)">
              <md-icon>move_to_inbox</md-icon>
              <span class="md-list-item-text">Outcomes</span>
            </md-list-item>
            <md-list-item @click="toggleContent(3)">
              <md-icon>move_to_inbox</md-icon>
              <span class="md-list-item-text">Get WETH</span>
            </md-list-item>
          </md-list>
        </md-app-drawer>
        <md-app-content>
          <div v-show="showOrderList == true" >
            <OrderList :outcomeAddresses="outcomeAddresses" :outcomeNames="outcomeNames"></OrderList>
          </div>
          <div v-show="showOutcomeContent == true">
            <OutcomeContent v-on:update="updateOutcomes" :outcomeAddresses="outcomeAddresses" :outcomeNames="outcomeNames" :outcomeAmounts="outcomeAmounts"></OutcomeContent>
          </div>
          <div v-show="showWETHContent == true">
            <GetWethContent></GetWethContent>
          </div>
        </md-app-content>
      </md-app>

  </div>
</template>

<script>
import OutcomeToken from "@/js/outcometoken.js";
import Voting from "@/js/voting.js";
import OutcomeItem from "@/components/OutcomeItem.vue";
import GetWethContent from "@/components/GetWethContent.vue";
import SetAllowance from "@/components/SetAllowance.vue";
import OrderList from "@/components/OrderList.vue";
import OutcomeContent from "@/components/OutcomeContent.vue";
import OutcomeList from "@/js/outcomelist.js"
var content = {
  ORDER_LIST: 0,
  MAKE_ORDER: 1,
  ADD_OUTCOME: 2,
  GET_WETH: 3
};

export default {
  name: "dashboard",
  data() {
    return {
      msg: "Outcome Token Test DApp",
      outcomeName: "",
      backValue: undefined,
      showMakeOrder: false,
      showOrderList: false,
      showOutcomeContent: false,
      showWETHContent: false,
      outcomeAddresses: undefined,
      outcomeNames: undefined,
      outcomeAmounts: undefined
    };
  },
  beforeCreate: function() {
    let self = this
    Voting.init();
    OutcomeToken.init();
    OutcomeList.init().then(function() {
      self.updateOutcomes();
    })
  },
  components: {
    OutcomeItem,
    SetAllowance,
    OrderList,
    GetWethContent,
    OutcomeContent
  },
  methods: {
    toggleContent: function(contentNbr) {
      var self = this;
      self.showOrderList = false;
      self.showMakeOrder = false;
      self.showOutcomeContent = false;
      self.showWETHContent = false;
      switch (contentNbr) {
        case content.ORDER_LIST:
          self.showOrderList = true;
          break;
        case content.MAKE_ORDER:
          self.showMakeOrder = true;
          break;
        case content.ADD_OUTCOME:
          self.showOutcomeContent = true;
          break;
        case content.GET_WETH:
          self.showWETHContent = true;
          break;
      }
    },

    updateOutcomes: async function() {
      let self = this;
      self.outcomeAddresses = await OutcomeList.getOutcomeAddresses();
      self.outcomeNames = [];
      self.outcomeAmounts = [];
      self.outcomeAddresses.map((address, i) => {
        OutcomeToken.getName(address).then(function(name) {
          self.$set(self.outcomeNames, i, name);
        });
        OutcomeToken.getAmount(address).then(function(amount) {
          self.$set(self.outcomeAmounts, i, amount);
        });
      })
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
  border: 1px solid rgba(#000, 0.12);
}

.md-drawer {
  width: 230px;
  max-width: calc(100vw - 125px);
}
</style>
