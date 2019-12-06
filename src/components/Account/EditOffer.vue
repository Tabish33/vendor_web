<template>
    <v-card class="pa-4 card">
        <v-layout column>
            <v-flex>
                 <v-flex shrink><v-switch v-model="offer.active" color="rgb(0, 133, 119)"></v-switch></v-flex>
            </v-flex>
            <v-flex>
                <v-text-field label="Title" v-model="offer.title"></v-text-field>
            </v-flex>
            <v-flex>
                <v-text-field label="SubTitle" v-model="offer.subtitle"></v-text-field>
            </v-flex>
            <v-flex>
                <v-text-field label=" Offer Type" v-model="offer.type"></v-text-field>
            </v-flex>
            <v-flex>
                <v-autocomplete item-text="name" multiple :items="products" return-object label="Items" v-model="items"></v-autocomplete>
            </v-flex>
            <v-flex>
                <v-btn @click="createOffer()" block dark color="rgb(0, 133, 119)" class="capitalize bold">
                    Create Offer
                </v-btn>
            </v-flex>

            <v-flex v-show="false">
                <loading :dialog="loading_dialog"></loading>
            </v-flex>
        </v-layout>
    </v-card>
</template>

<script>
import firebase from "firebase"
import { storeDb } from '../firebase/init'
import moment from "moment"
import Loading from "./Loading"
export default {
    props: ["Offer"],

    components: {
        "loading": Loading
    },

    data(){
        return {
            offer: {},
            items: [],
            products: [],
            loading_dialog: false
        }
    },

    methods: {
        async createOffer(){
            this.loading_dialog = true

            let offer_id = this.offer.id
            let ref = `offers`

            for (let i = 0; i < this.items.length; i++) {
                const item = this.items[i];
                await storeDb.collection(`${ref}/${offer_id}/items`).doc(item.id.toString()).set(item)
            }
            await storeDb.collection(ref).doc(offer_id.toString()).set(this.offer)
            await this.removeDeletedItems(offer_id)

            this.$emit("offerEdited",{items: this.items, details: this.offer})
            this.resetData()
            
            this.loading_dialog = false    
        },

        async removeDeletedItems(offer_id){
            let original_items = this.Offer.items

            for (let i = 0; i < original_items.length; i++) {
                let original_item = original_items[i];
                let found = false;
                for (let j = 0; j < this.items.length; j++) {
                    let item = this.items[j];
                    if (item.id == original_item.id ) found = true        
                } 
                if(!found){
                    await storeDb.collection(`offers/${offer_id}/items`).doc(original_item.id.toString()).delete()
                }
            }
        },

        resetData(){
            this.offer = { offer_type: "vendor"}
            this.items = []
        },

        async getInventory(){
            if(this.products.length != 0) return

            let uid = await firebase.auth().currentUser.uid;
            let ref = `Vendors/${uid}/products`
            let products_snap = await storeDb.collection(ref).get()

            products_snap.forEach(doc=>{
                let product = doc.data()
                this.products.push(product);
            })
        },

        deepCopy(obj){
            return JSON.parse(JSON.stringify(obj))
        }
    },

    watch:{
        Offer(val){
            if (val) {
                this.offer = this.deepCopy(val.details)
                val.items.forEach(item=>{
                    this.items.push(this.deepCopy(item))
                })
            }
        }
    },

    created(){
        this.getInventory()
    }
}
</script>