<template>
  <div class="dashboard">
    <h1>{{ msg }}</h1>
    <div>
      <input v-model="outcomeName">
      <input v-on:click="addOutcomeToken" id="AddOutcomeBtn" type="button" value="Add Outcome Token" :disabled="isDisabled">
      <ul>
        <li v-for="name in outcomeNames" :key="name.id">
            {{ name }} :  <input v-model="backValue"><input id="BackBtn" type="button" value="Back Outcome" @click="back(name)">
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import OutcomeToken from '@/js/outcometoken.js'

export default {
  name: 'dashboard',
  data () {
    return {
      msg: 'Outcome Token Test DApp',
      outcomes: new Map(),
      outcomeNames: [],
      outcomeName: "",
      disabled: false,
      backValue: ""
    }
  },
  computed: {
    isDisabled () {
      return this.disabled
    }
  },
  beforeCreate: function () {
    OutcomeToken.init()
  },
  methods: {
    back: function (name) {
      OutcomeToken.back(this.outcomes.get(name), this.backValue)
    },

    addOutcomeToken: function () {
      var self = this
      self.disabled = true
      OutcomeToken.deployNew(self.outcomeName).then(function(address) {
        self.outcomes.set(self.outcomeName, address)
        self.outcomeNames.push(self.outcomeName)
        self.outcomeName = ""
        self.disabled = false
      })
    }
  }
}
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
