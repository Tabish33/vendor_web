<template>
    <v-layout fill-height column>
        <v-flex shrink>
            <v-layout column>
                <v-card flat>
                <v-flex shrink class="x_large bold mt-4">Orders</v-flex>
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
                <v-flex class="mt-2" shrink v-for="(order,i) in getOrders" :key="i">
                    <order-card :order="order" v-on:markOrder="markOrderAsOutForDelivery($event)"></order-card>
                </v-flex>
            </v-layout>
        </v-flex>
    </v-layout>
</template>

<script>
import firebase from "firebase"
import { storeDb } from '../firebase/init'
import OrderCard from "./OrderCard"

export default {
    components: {
        "order-card": OrderCard
    },

    data(){
        return {
            orders: [],
            
            order_details_dialog: false,
            selected_order: null,
            item_ids: {},
            image_1: require("@/assets/item_1.png"),
            image_2: require("@/assets/item_2.png"),
            image_3: require("@/assets/item_3.png"),
            image_4: require("@/assets/item_4.png"),
        }
    },

    computed:{
        getOrders(){
            return this.$store.getters.getPendingOrders;
        }
    },

    methods:{
        getConfirmedOrders(){
            storeDb.collection("vendor_orders")
            .where("status","==","confirmed")
            .onSnapshot( querySnap => {
                querySnap.forEach(doc=>{
                    let order = doc.data()
                    
                    if(!this.item_ids[order.id] && order.status == "confirmed"){
                         this.audio.play();
                         this.item_ids[order.id] = 1;
                         this.orders.push(order)
                    }
                })

                console.log("confirmed orders",this.orders.length);
                
            })
        },

        async markOrderAsOutForDelivery({order}){
            await this.$store.dispatch("markOrderAsOutForDelivery",order)
            this.sendNotificationToDriver(order)    
            this.sendOutForDeliveryNotification(order)
        },

        sendNotificationToDriver(order){
            let uid = 'x93e8m6Vy5d14O2meMJVnRObjPx2';
            var sendNotf = firebase
                            .functions()
                            .httpsCallable("sendNotificationToDriver");
            sendNotf({ uid, order });
        },

        sendOutForDeliveryNotification(order){
            let uid = order.res_id;
            let branch = order.res_branch;
            var sendNotf = firebase
                            .functions()
                            .httpsCallable("sendOutForDeliveryNotification");
            sendNotf({ uid, order, branch });
        },

        showOrderDetails(order){
            this.selected_order = order; 
            this.order_details_dialog= true;
        }
    },

    created(){
        // this.getConfirmedOrders()
    }
}
</script>