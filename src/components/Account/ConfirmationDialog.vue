<template>
    <v-card v-if="data" class="pa-3 card">
        <v-flex shrink class="x_large bold">{{data.title}} <v-icon>{{data.icon}}</v-icon> </v-flex>
        <hr class="mt-3 mb-2">
        <v-flex class="bold mt-2 mb-2" style="color:grey">{{data.body}}</v-flex>
        <v-flex>
            <v-layout>
                <v-spacer></v-spacer>
                <v-flex shrink><v-btn @click="sendAnswer(true)" dark color="rgb(0, 133, 119)">Yes</v-btn></v-flex>
                <v-flex shrink><v-btn @click="sendAnswer(false)" dark color="warning">No</v-btn></v-flex>
            </v-layout>
        </v-flex>
    </v-card>
</template>

<script>
export default {
    props: ["data"],
    
    methods: {
        sendAnswer(answer){
            this.$emit("answer",answer)
        }
    }
}
</script>