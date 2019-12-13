<template>
    <v-card class="pa-4 card">
        <v-layout column>
            <v-flex class="text-xs-right"><v-icon @click="exit()" class="pointer">cancel</v-icon></v-flex>
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
                <img width="350px" :src="offer.image_url" />
                <upload-btn block outline @file-update="saveLogo" label="Choose Image">Choose Image</upload-btn>
            </v-flex>
            <v-flex>
                <v-btn @click="updateOffer()" block dark color="rgb(0, 133, 119)" class="capitalize bold">
                    Edit Offer
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
import UploadButton from "vuetify-upload-button";
export default {
    props: ["Offer"],

    components: {
        "loading": Loading,
        "upload-btn": UploadButton,
    },

    data(){
        return {
            offer: {},
            items: [],
            products: [],
            loading_dialog: false,
            image:null
        }
    },

    methods: {
        async updateOffer(){
            this.loading_dialog = true
            await this.uploadImage()
            let offer_id = this.offer.id
            let ref = `offers`

            for (let i = 0; i < this.items.length; i++) {
                const item = this.items[i];
                await this.$store.dispatch("addToDb", {"id":item.id.toString(), "ref":`${ref}/${offer_id}/items`, "data": item })
            }
            await this.$store.dispatch("updateOnDb",{"id":offer_id.toString(),ref,"data":this.offer});
            await this.removeDeletedItems(offer_id)

            this.$emit("offerEdited",{items: this.items, details: this.offer})
            this.resetData()
            
            this.loading_dialog = false    
        },

        async uploadImage(){
            if (!this.image) return;
            
            let file = this.image
            let ref = `vendor_offers/${this.offer.id}`;
            let url = await this.$store.dispatch("uploadImage",{ref,file});
            this.offer.image_url = url;
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
                    let ref =`offers/${offer_id}/items`;
                    let id = original_item.id.toString()
                    await this.$store.dispatch("deleteFromDb",{id,ref})
                }
            }
        },

        saveLogo(file){
            this.image = file
        },

        exit(){
            this.resetData()
            this.$emit("exit")
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