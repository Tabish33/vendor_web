<template>
    <v-layout fill-height column>
        <v-flex shrink class="x_large bold">Orders</v-flex>
        <hr class="mt-3 mb-2">
        <v-flex class="mt-2">
            <v-layout column>
                <v-flex>
                    <v-layout>
                        <v-flex md2 class="bold" style="color:grey">Id</v-flex>
                        <v-flex md1 class="bold" style="color:grey">Bill</v-flex>
                        <v-flex md2 class="bold" style="color:grey">Time</v-flex>
                        <v-flex md2 class="bold" style="color:grey">Date</v-flex>
                        <v-flex md4 class="bold text-xs-right" style="color:grey">Location</v-flex>
                    </v-layout>
                </v-flex>
                <hr class="mt-3 mb-2">
                <v-flex class="mt-2" shrink v-for="(order,index) in orders" :key="index">
                    <v-card  @click="showOrderDetails(order)" class="card pa-3 pointer">
                        <v-layout column>
                            <v-flex>
                                <v-layout>
                                    <v-flex md2 class="bold" style="color:grey">{{order.id}}</v-flex>
                                    <v-flex md1 class="bold" style="color:grey">₹{{order.bill}}</v-flex>
                                    <v-flex md2 class="bold" style="color:grey">{{order.time}}</v-flex>
                                    <v-flex md2 class="bold" style="color:grey">{{order.date}}</v-flex>
                                    <v-flex md5 class="bold text-xs-right" style="color:grey">{{order.address}}</v-flex>
                                </v-layout>
                            </v-flex>
                            <v-flex class="mt-2">
                                <v-layout row wrap>
                                    <v-flex shrink v-for="(item,index) in order.items" :key="index" >
                                        <v-chip dark class="bold" color="rgb(255, 152, 0)">
                                            {{item.data.name}} / {{item.quantity}} {{item.data.unit}} 
                                        </v-chip>
                                    </v-flex>
                                </v-layout>
                            </v-flex>
                            <v-flex class="text-xs-right">
                                <v-btn dark class="capitalize bold" color="rgb(0, 133, 119)">
                                    <v-icon class="mr-2">local_shipping</v-icon>Mark Out for Delivery
                                </v-btn>
                            </v-flex>
                        </v-layout>
                    </v-card>
                </v-flex>
            </v-layout>

            <!-- <v-layout v-else>
                <v-flex class="text-xs-center">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </v-flex>
            </v-layout> -->
        </v-flex>

        <!-- DIALOGS -->
        <v-flex v-show="false">
            <!-- ORDER DETAILS -->
            <!-- <v-dialog width="560px" v-model="order_details_dialog"> -->
                <!-- <order-details :order="selected_order"></order-details> -->
            <!-- </v-dialog> -->
        </v-flex>
    </v-layout>
</template>

<script>
import firebase from "firebase"
import { storeDb } from '../firebase/init'

export default {

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
        getConfirmedOrders(){
            storeDb.collection("vendor_orders")
            .where("status","==","confirmed")
            .onSnapshot( querySnap => {
                querySnap.forEach(doc=>{
                    console.log(doc.data());
                    this.orders.push(doc.data())
                    this.orders = this.orders;
                })
            })
        },

        showOrderDetails(order){
            this.selected_order = order; 
            this.order_details_dialog= true;
        }
    },

    created(){
        this.getConfirmedOrders()
    }
}
</script>