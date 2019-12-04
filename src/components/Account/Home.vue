<template>
    <v-layout fill-height>
        <v-flex style="width:240px"  shrink>
            <app-bar  v-on:indexChanged="changeSelectedIndex($event)"></app-bar>
        </v-flex>
        <v-flex  class="pl-5 pr-5">
            <dashboard v-if="selected_index == 0" ></dashboard>
            <out-for-delivery v-else-if="selected_index == 1"></out-for-delivery>
            <previous-orders v-else-if="selected_index == 2" ></previous-orders>
            <inventory v-else-if="selected_index == 3"></inventory>
            <notifications v-else-if="selected_index == 4"></notifications>
            <offers v-else-if="selected_index == 5"></offers>
        </v-flex>
    </v-layout>    
</template>

<script>
import AppBar from "./AppBar"
import DashBoard from "./DashBoard"
import PreviousOrders from "./PreviousOrders"
import OutForDelivery from "./OutForDelivery"
import Inventory from "./Inventory"
import Notifications from "./Notifications"
import Offers from "./Offers"

export default {
    components:{
        "app-bar": AppBar,
        "dashboard": DashBoard,
        "out-for-delivery": OutForDelivery,
        "previous-orders":PreviousOrders,
        "inventory": Inventory,
        "notifications": Notifications,
        "offers" : Offers
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

