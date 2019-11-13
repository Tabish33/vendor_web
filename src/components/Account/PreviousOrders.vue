<template>
    <v-layout fill-height column>
        <v-flex shrink >
            <v-layout column>
                <v-card flat>
                <v-flex shrink class="x_large bold mt-4">Completed Orders</v-flex>
                <hr class="mt-3 mb-2">
                <v-flex shrink>
                    <v-layout>
                        <v-flex md2 class="bold" style="color:grey">Id</v-flex>
                        <v-flex md1 class="bold" style="color:grey">Bill</v-flex>
                        <v-flex md2 class="bold" style="color:grey">Time</v-flex>
                        <v-flex md2 class="bold" style="color:grey">Date</v-flex>
                        <v-flex md4 class="bold text-xs-right" style="color:grey">Location</v-flex>
                    </v-layout>
                </v-flex>
                <hr class="mt-3 mb-2">
                </v-card>
            </v-layout>
        </v-flex>
        <v-flex class="mt-2">
            <v-layout  column>
                <v-flex class="mt-2" shrink v-for="(order,i) in orders" :key="i">
                    <order-card :order="order"></order-card>
                </v-flex>
            </v-layout>
        </v-flex>
    </v-layout>
</template>

<script>
import firebase from "firebase"
import { storeDb } from '../firebase/init'
import OrderCard from "./OrderCard"
import {bus} from "../../main"

export default {
    components: {
        "order-card": OrderCard
    },

    data(){
        return {
            orders: [],
            order_details_dialog: false,
            selected_order: null,
            image_1: require("@/assets/item_1.png"),
            image_2: require("@/assets/item_2.png"),
            image_3: require("@/assets/item_3.png"),
            image_4: require("@/assets/item_4.png"),
        }
    },

    methods:{
       async getCompletedOrders(){
            let orders_snap = await storeDb.collection("vendor_orders")
                                    .where("status","==","completed")
                                    .get()

            orders_snap.forEach(doc=>{
                let order = doc.data();
                this.orders.push(order);
            })
        },

    },

    created(){
        this.getCompletedOrders()
    }
}
</script>