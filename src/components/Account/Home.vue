<template>
    <v-layout fill-height>
        <v-flex style="width:240px"  shrink>
            <app-bar  v-on:indexChanged="changeSelectedIndex($event)"></app-bar>
        </v-flex>
        <v-flex  class="pl-5 pr-5">
            <dashboard v-if="selected_index == 0" ></dashboard>
            <out-for-delivery v-else-if="selected_index == 1"></out-for-delivery>
            <previous-orders v-else-if="selected_index == 2" ></previous-orders>
            <inventory v-else ></inventory>
        </v-flex>
    </v-layout>    
</template>

<script>
import AppBar from "./AppBar"
import DashBoard from "./DashBoard"
import PreviousOrders from "./PreviousOrders"
import OutForDelivery from "./OutForDelivery"
import Inventory from "./Inventory"

export default {
    components:{
        "app-bar": AppBar,
        "dashboard": DashBoard,
        "out-for-delivery": OutForDelivery,
        "previous-orders":PreviousOrders,
        "inventory": Inventory
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

