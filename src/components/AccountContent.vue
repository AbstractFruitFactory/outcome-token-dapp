<template>
    <div>
        {{ events }}
    </div>
</template>

<script>
    import OutcomeToken from "@/js/outcometoken.js";

    export default {
        data() {
            return {
                events: []
            }
        },

        created: function() {
            OutcomeToken.init()
        },
    
        watch: {
            outcomes: function(outcomes) {
                let self = this
                outcomes.map((outcome) => {
                    OutcomeToken.getPastTransferEvents(outcome.address).then(function(result) {
                        self.events.push(result)
                    })
                    OutcomeToken.listenToTransferEvent(outcome.address).then(function(result) {
                        self.events.push(result)
                    })
                })
            }
        },

        props: ['outcomes'],
    
        methods: {
    
        }
    
    }
</script>
