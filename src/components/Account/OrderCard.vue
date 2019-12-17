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
                <v-btn @click="showOutForDeliveryDialog(order)" dark class="capitalize bold" color="rgb(0, 133, 119)">
                    <v-icon class="mr-2">local_shipping</v-icon>Mark Out for Delivery
                </v-btn>
            </v-flex>
            <v-flex v-if="order.status =='completed'">
                <v-layout>
                    <v-spacer></v-spacer>
                    <v-flex style="align-self:center" shrink>
                        <span v-if="!order.paid" style="color:white;background:red;border-radius:5px" class="bold pl-3 pr-3 pt-2 pb-2" >Unpaid</span>
                        <span v-else style="color:white;background:green;border-radius:5px" class="bold pl-3 pr-3 pt-2 pb-2" >Paid</span>
                    </v-flex>
                    <v-flex class="ml-2" shrink>
                        <v-btn @click="showPaidStatusDialog(order)" dark class="capitalize bold" color="rgb(0, 133, 119)">
                            <v-icon class="mr-2">attach_money</v-icon>Update
                        </v-btn>
                    </v-flex>
                    <v-flex class="ml-2" shrink>
                        <v-btn @click="showReminderDialog(order)" dark class="capitalize bold" color="rgb(0, 133, 119)">
                            <v-icon class="mr-2">notifications</v-icon>Remind
                        </v-btn>
                    </v-flex>
                </v-layout>   
            </v-flex>
        </v-layout>

        <v-flex v-show="false">
            <v-dialog v-model="confirm_dialog" width="400">
                <confirm-dialog :data="dialog_data" @answer="answer($event)"></confirm-dialog>
            </v-dialog>

            <v-dialog width="400" v-model="reminder_dialog">
                <v-card class="pa-4">
                    <v-layout column>
                        <v-flex>
                            <v-text-field label="Title" v-model="notf.title"></v-text-field>
                        </v-flex>
                        <v-flex>
                            <v-text-field label="Subtitle" v-model="notf.subtitle"></v-text-field>
                        </v-flex>
                        <v-flex>
                            <v-btn @click="sendNotification()" dark block color="rgb(0, 133, 119)" class="capitalize bold" >
                                Send Notification
                            </v-btn>
                        </v-flex>
                    </v-layout>
                </v-card>
            </v-dialog>
        </v-flex>
    </v-card>
</template>

<script>
import ConfirmationDialog from "./ConfirmationDialog"
import firebase from "firebase"
import { storeDb } from '../firebase/init';
export default {
    props: ["order"],
    
    components:{
        "confirm-dialog": ConfirmationDialog
    },

    data(){
        return{
            confirm_dialog: false,
            selected_order: null,
            dialog_data: null,
            reminder_dialog: false,
            notf: {}
        }
    },

    methods: {
        showOutForDeliveryDialog(order){
            this.selected_order = order;
            let title = "Out For Delivery"
            let icon = "local_shipping"
            let body = "Are you sure you want to mark this order as out for delivery?"
            this.setDialogData({title,icon,body})
            this.confirm_dialog = true
        },

        showPaidStatusDialog(order){
            this.selected_order = order;
            let status = order.paid ? "unpaid" :"paid";
            let title = "Payment Status"
            let icon = "attach_money"
            let body = `Are you sure you want to mark this order as ${status} ?`
            this.setDialogData({title,icon,body})
            this.confirm_dialog = true
        },

        showReminderDialog(order){
            this.selected_order = order;
            this.reminder_dialog = true;
        },

        async sendNotification(){
           let uid  = this.selected_order.res_id
           let branch = this.selected_order.res_branch 
           let notf= this.notf

           var sendPaymentReminderNotification = firebase
            .functions()
            .httpsCallable("sendPaymentReminderNotification");

           await sendPaymentReminderNotification({ uid, branch, notf });
           this.reminder_dialog = false
        },

        resetNotificationData(){
            this.notf = {}
        },
        
        setDialogData({title,icon,body}){
            this.dialog_data = {}
            this.dialog_data.title = title
            this.dialog_data.icon = icon
            this.dialog_data.body = body
        },

        markOrderAsCompleted(){
            this.$emit("markOrder",{"order":this.selected_order})
        },

        markOrderAsPaid(){
            this.$emit("changePaymentStatus",{"order":this.selected_order})
        },

        async answer(answer){
            if (answer) {
                if(this.selected_order.status == "confirmed") this.markOrderAsCompleted();
                else if (this.selected_order.status == "completed" ) this.markOrderAsPaid();
            }
            this.confirm_dialog = false
        }
    }
}
</script>  