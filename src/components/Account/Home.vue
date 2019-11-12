<template>
    <v-layout fill-height>
        <v-flex style="width:240px"  shrink>
            <app-bar style="position:fixed" v-on:indexChanged="changeSelectedIndex($event)"></app-bar>
        </v-flex>
        <v-flex  class="pl-5 pr-5">
            <dashboard v-if="selected_index == 0" ></dashboard>
            <previous-orders v-else-if="selected_index == 1" ></previous-orders>
        </v-flex>
    </v-layout>    
</template>

<script>
import AppBar from "./AppBar"
import DashBoard from "./DashBoard"
import PreviousOrders from "./PreviousOrders"
export default {
    components:{
        "app-bar": AppBar,
        "dashboard": DashBoard,
        "previous-orders":PreviousOrders
    },

    data(){
        return {
            selected_index: 0,
        }
    },

    methods: {
        changeSelectedIndex(index){
            this.selected_index = index
        }
    },

    
}
</script>

