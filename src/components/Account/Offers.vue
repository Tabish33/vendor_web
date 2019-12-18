<template>
    <v-layout fill-height column>
        <v-flex shrink>
            <v-layout column>
                <v-card flat>
                    <v-flex>
                        <v-layout>
                            <v-flex class="x_large bold mt-4">Offers</v-flex>
                            <v-flex class="" shrink>
                                 <v-btn @click="show_offers_dialog=true" dark color="rgb(0, 133, 119)" class="capitalize bold">Create Offer<v-icon></v-icon></v-btn>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <hr class="mt-3 mb-2">
                </v-card>
            </v-layout>
        </v-flex>
        <v-flex class="mt-2">
            <v-layout wrap>
                <v-flex md4 class="mt-2 pa-2" shrink v-for="(offer,i) in offers" :key="i">
                    <v-card class="pa-4 card" >
                        <v-layout column>
                            <v-flex class="mb-1">
                                <v-layout>
                                    <v-flex shrink style="align-self:center" class="bold large">{{offer.details.title}}</v-flex>
                                    <v-flex class="ml-3" v-if="offer.details.active" >
                                        <span class="bold pa-1" style="background:green;border-radius:4px;color:white">Active</span>
                                    </v-flex>
                                    <v-spacer></v-spacer>
                                    <v-flex shrink>
                                        <v-icon color="rgb(0, 133, 119)" @click="showEditOfferDialog(offer,i)">edit</v-icon>
                                    </v-flex>
                                    <v-flex @click="showDeleteOfferDialog(offer)" class="pointer" shrink><v-icon color="warning">delete</v-icon></v-flex>
                                </v-layout>
                            </v-flex>
                            <v-flex class="bold">{{offer.details.subtitle}}</v-flex>
                            <v-flex class="bold mb-2" style="color:green">{{offer.details.type}}</v-flex>
                            <v-flex>
                                <v-layout wrap>
                                    <v-flex shrink v-for="(item,j) in offer.items" :key="j" >
                                        <v-chip dark class="bold" color="warning">{{item.name}}</v-chip>
                                    </v-flex>
                                </v-layout>
                            </v-flex>
                        </v-layout>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-flex>
        <!-- DIALOGS -->
        <v-flex v-show="false">
            <v-dialog persistent width="400" v-model="show_offers_dialog">
                <create-offer @exit="show_offers_dialog=false" @offerCreated="addOffer($event)"></create-offer>
            </v-dialog>

            <v-dialog persistent width="400" v-model="edit_offer_dialog">
                <edit-offer @exit="edit_offer_dialog=false" :Offer="selected_offer" @offerEdited="editOffer($event)"></edit-offer>
            </v-dialog>

            <v-dialog v-model="confirm_dialog" width="400">
                <confirm-dialog :data="dialog_data" @answer="answer($event)"></confirm-dialog>
            </v-dialog>

            <loading :dialog="loading_dialog"></loading>
        </v-flex>
    </v-layout>
</template>

<script>
import firebase from "firebase"
import { storeDb } from '../firebase/init'
import Loading from "./Loading"
import ConfirmationDialog from "./ConfirmationDialog"
const CreateOffer = () => import("./CreateOffer")
const EditOffer = () => import("./EditOffer")
export default {
    components: {
        "create-offer": CreateOffer,
        "edit-offer": EditOffer,
        "confirm-dialog": ConfirmationDialog,
        "loading": Loading,
    },

    data(){
        return {
            offers: [],
            show_offers_dialog: false,
            edit_offer_dialog: false,
            selected_offer: null,
            selected_offer_index: null,
            dialog_data: null,
            confirm_dialog: false,
            selected_offer: null,
            loading_dialog: false,
        }
    },

    methods:{
        async getOffers(){
            let offers_snap = await storeDb.collection("offers").get()
            let offers = []

            offers_snap.forEach(doc=> {
                let offer  = doc.data()
                offer.id = doc.id;
                offers.push(offer)
            })
            
            
            for (let i = 0; i < offers.length; i++) {
                let new_offer = { items: []}
                let id = offers[i].id;
                let offer = offers[i];
                let ref = `offers/${id}/items`
                let items_snap = await storeDb.collection(ref).get()

                new_offer.details = offer;
                items_snap.forEach(doc=>{
                    new_offer.items.push(doc.data())
                })

                this.offers.push(new_offer)

            }
        },

        showDeleteOfferDialog(offer){
            this.selected_offer = offer

            this.dialog_data = {}
            this.dialog_data.title = "Delete Offer";
            this.dialog_data.icon = "delete";
            this.dialog_data.body = `Are you sure you want to delete this offer?`
            
            this.confirm_dialog = true
        },

        showEditOfferDialog(offer,index){
            this.selected_offer= offer
            this.selected_offer_index = index
            this.edit_offer_dialog = true
        },

        async answer(answer){            
             let offer_id = this.selected_offer.details.id.toString()
            if (answer) {
                this.loading_dialog = true

                this.selected_offer.items.forEach(item => {
                    storeDb.collection(`offers/${offer_id}/items`).doc(item.id.toString()).delete()
                })
                await storeDb.collection("offers").doc(offer_id).delete();
            }   
            this.confirm_dialog = false

            this.offers = this.offers.filter(offer=>{
                if(offer.details.id == offer_id ) return false
                return true
            })

            this.loading_dialog = false
        },

        editOffer(offer){
            this.offers.splice(this.selected_offer_index,1, offer);
            this.selected_offer= null
            this.selected_offer_index = null
            this.edit_offer_dialog = false
        },

        addOffer(offer){
            this.offers.splice(0,0, offer)
            this.show_offers_dialog=false
        }
    },

    created(){
        this.getOffers()
    }
}
</script>