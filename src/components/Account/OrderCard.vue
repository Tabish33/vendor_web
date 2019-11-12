<template>
    <v-card class="card pa-3">
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
                    <v-flex shrink v-for="(item,j) in order.items" :key="j" >
                        <v-chip dark class="bold" color="rgb(255, 152, 0)">
                            {{item.data.name}} / {{item.quantity}} {{item.data.unit}} 
                        </v-chip>
                    </v-flex>
                </v-layout>
            </v-flex>
            <v-flex v-if="order.status =='confirmed'" class="text-xs-right">
                <v-btn @click="showDialog(order)" dark class="capitalize bold" color="rgb(0, 133, 119)">
                    <v-icon class="mr-2">local_shipping</v-icon>Mark Out for Delivery
                </v-btn>
            </v-flex>
        </v-layout>

        <v-flex v-show="false">
            <v-dialog v-model="confirm_dialog" width="400">
                <v-card class="pa-3 card">
                    <v-flex shrink class="x_large bold">Out For Delivery <v-icon>local_shipping</v-icon> </v-flex>
                    <hr class="mt-3 mb-2">
                    <v-flex class="bold mt-2 mb-2" style="color:grey">Are you sure you want to mark this order as out for delivery?</v-flex>
                    <v-flex>
                        <v-layout>
                            <v-spacer></v-spacer>
                            <v-flex shrink><v-btn @click="markOrderAsCompleted()" dark color="rgb(0, 133, 119)">Yes</v-btn></v-flex>
                            <v-flex shrink><v-btn @click="confirm_dialog= false" dark color="warning">No</v-btn></v-flex>
                        </v-layout>
                    </v-flex>
                </v-card>
            </v-dialog>
        </v-flex>
    </v-card>
</template>

<script>
export default {
    props: ["order"],

    data(){
        return{
            confirm_dialog: false,
            selected_order: null,
        }
    },

    methods: {
        showDialog(order){
            this.selected_order = order;
            this.confirm_dialog = true
        },

        markOrderAsCompleted(order){
            this.confirm_dialog = false
            this.$emit("markOrder",{"order":this.selected_order})
        }
    }
}
</script>  